import { array } from "fp-ts/lib/Array"
import { left, right } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { fromEither, map, TaskEither, taskEither } from "fp-ts/lib/TaskEither"
import { range, sum } from "ramda"
import * as Do from "../src/index"

const bind = Do.bind(taskEither)
const into = Do.into(taskEither)
const exec = Do.exec(taskEither)
const sequence = Do.parallel(array, taskEither)

const throwUnexpectedCall = () => {
  throw new Error("Unexpected call")
}

describe("Do/Let/Return", () => {
  describe("for TaskEither", () => {
    const success: <R>(r: R) => TaskEither<string, R> = r => fromEither(right(r))
    const failure: (l: string) => TaskEither<string, never> = l => fromEither(left(l))

    it("chains scoped computations when using value", async () => {
      const result = pipe(
        success(10),
        into("x"),
        bind("y", () => success(5)),
        map(({ x, y }) => x - y),
      )

      expect(await result()).toEqual(right(5))
    })

    it("chains scoped computations when using function", async () => {
      const result = pipe(
        success(3),
        into("x"),
        bind("y", ({ x }) => success(x.toString())),
        map(({ x, y }) => y + x),
      )

      expect(await result()).toEqual(right("33"))
    })

    it("chains scoped computations with effects", async () => {
      const result = pipe(
        success(10),
        into("x"),
        exec(() => success(undefined)),
        bind("y", () => success(5)),
        map(({ x, y }) => x - y),
      )

      expect(await result()).toEqual(right(5))
    })

    it("chains multiple scoped computations", async () => {
      const result = pipe(
        success(23),
        into("x"),
        sequence("ys", ({ x }) => range(0, x).map(() => success(1))),
        map(({ x, ys }) => x - sum(ys)),
      )

      expect(await result()).toEqual(right(0))
    })

    it("short circuits scoped computations when using value", async () => {
      const result = pipe(
        success(3),
        into("x"),
        exec(() => failure("some error")),
        map(throwUnexpectedCall),
      )

      expect(await result()).toEqual(left("some error"))
    })

    it("short circuits scoped computations when using function", async () => {
      const result = pipe(
        success(3),
        into("x"),
        exec(() => failure("some error")),
        map(throwUnexpectedCall),
      )

      expect(await result()).toEqual(left("some error"))
    })

    it("short circuits scoped computations with effects", async () => {
      const result = pipe(
        success(3),
        into("x"),
        exec(() => failure("some error")),
        map(throwUnexpectedCall),
      )

      expect(await result()).toEqual(left("some error"))
    })

    it("short circuits multiple scoped computations", async () => {
      const result = pipe(
        success(23),
        into("x"),
        sequence("ys", ({ x }) =>
          range(0, x).map(i => (i === 3 ? failure("some error") : success(1))),
        ),
        map(throwUnexpectedCall),
      )

      expect(await result()).toEqual(left("some error"))
    })
  })
})
