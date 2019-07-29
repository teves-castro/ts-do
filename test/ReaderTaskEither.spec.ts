import { array } from "fp-ts/lib/Array"
import { left, right } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import {
  ask,
  fromEither,
  map,
  ReaderTaskEither,
  readerTaskEither,
  run as runRTE,
} from "fp-ts/lib/ReaderTaskEither"
import { range, sum } from "ramda"
import * as Do from "../src/index"

const bind = Do.bind(readerTaskEither)
const into = Do.into(readerTaskEither)
const exec = Do.exec(readerTaskEither)
const sequence = Do.sequence(array, readerTaskEither)

const throwUnexpectedCall = () => {
  throw new Error("Unexpected call")
}

type Env = { some: string }
const env = { some: "env" }

const run = <E>(e: E) => <L, R>(ma: ReaderTaskEither<E, L, R>) => runRTE(ma, e)

describe("Do/Let/Return", () => {
  describe("for ReaderTaskEither", () => {
    const success: <R>(r: R) => ReaderTaskEither<Env, string, R> = r =>
      fromEither(right(r))
    const failure: (l: string) => ReaderTaskEither<Env, string, never> = l =>
      fromEither(left(l))

    it("environment is available as part of the scope", async () => {
      const result = pipe(
        ask<Env, string>(),
        into("env"),
        run(env),
      )
      expect(await result).toEqual(right({ env }))
    })

    it("chains scoped computations when using value", async () => {
      const result = pipe(
        success(10),
        into("x"),
        bind("y", () => success(5)),
        map(({ x, y }) => x - y),
        run(env),
      )

      expect(await result).toEqual(right(5))
    })

    it("chains scoped computations when using function", async () => {
      const result = pipe(
        success(3),
        into("x"),
        bind("y", ({ x }) => success(x.toString())),
        map(({ x, y }) => y + x),
        run(env),
      )

      expect(await result).toEqual(right("33"))
    })

    it("chains scoped computations with effects", async () => {
      const result = await pipe(
        success(10),
        into("x"),
        exec(() => success(undefined)),
        bind("y", () => success(5)),
        map(({ x, y }) => x - y),
        run(env),
      )

      expect(await result).toEqual(right(5))
    })

    it("chains multiple scoped computations", async () => {
      const result = await pipe(
        success(23),
        into("x"),
        sequence("ys", ({ x }) => range(0, x).map(() => success(1))),
        map(({ x, ys }) => x - sum(ys)),
        run(env),
      )

      expect(await result).toEqual(right(0))
    })

    it("short circuits scoped computations when using value", async () => {
      const result = await pipe(
        success(3),
        into("x"),
        exec(() => failure("some error")),
        map(() => throwUnexpectedCall),
        run(env),
      )

      expect(await result).toEqual(left("some error"))
    })

    it("short circuits scoped computations when using function", async () => {
      const result = await pipe(
        success(3),
        into("x"),
        exec(() => failure("some error")),
        map(() => throwUnexpectedCall),
        run(env),
      )

      expect(await result).toEqual(left("some error"))
    })

    it("short circuits scoped computations with effects", async () => {
      const result = await pipe(
        success(3),
        into("x"),
        exec(() => failure("some error")),
        map(() => throwUnexpectedCall),
        run(env),
      )

      expect(await result).toEqual(left("some error"))
    })

    it("short circuits multiple scoped computations", async () => {
      const result = await pipe(
        success(23),
        into("x"),
        sequence("ys", ({ x }) =>
          range(0, x).map(i => (i === 3 ? failure("some error") : success(1))),
        ),
        map(() => throwUnexpectedCall),
        run(env),
      )

      expect(await result).toEqual(left("some error"))
    })
  })
})
