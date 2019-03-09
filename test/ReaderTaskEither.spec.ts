import { left, right } from "fp-ts/lib/Either"
import { ask, fromEither, ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither"
import { range, sum } from "ramda"
import "../src/index"

const throwUnexpectedCall = () => {
  throw new Error("Unexpected call")
}

type Env = { some: string }
const env = { some: "env" }

describe("Do/Let/Return", () => {
  describe("for ReaderTaskEither", () => {
    const success: <R>(r: R) => ReaderTaskEither<Env, string, R> = r => fromEither(right(r))
    const failure: (l: string) => ReaderTaskEither<Env, string, never> = l => fromEither(left(l))

    it("environment is available as part of the scope", async () => {
      const result = await ask<Env, string>()
        .into("env")
        .run(env)
      expect(result).toEqual(right({ env }))
    })

    it("chains scoped computations when using value", async () => {
      const result = await success(10)
        .into("x")
        .let("y", success(5))
        .return(({ x, y }) => x - y)
        .run(env)

      expect(result).toEqual(right(5))
    })

    it("chains scoped computations when using function", async () => {
      const result = await success(3)
        .into("x")
        .let("y", ({ x }) => success(x.toString()))
        .return(({ x, y }) => y + x)
        .run(env)

      expect(result).toEqual(right("33"))
    })

    it("chains scoped computations with effects", async () => {
      const result = await success(10)
        .into("x")
        .do(success(undefined))
        .let("y", success(5))
        .return(({ x, y }) => x - y)
        .run(env)

      expect(result).toEqual(right(5))
    })

    it("chains multiple scoped computations", async () => {
      const result = await success(23)
        .into("x")
        .for("ys", ({ x }) => range(0, x).map(() => success(1)))
        .return(({ x, ys }) => x - sum(ys))
        .run(env)

      expect(result).toEqual(right(0))
    })

    it("short circuits scoped computations when using value", async () => {
      const result = await success(3)
        .into("x")
        .do(failure("some error"))
        .return(() => throwUnexpectedCall)
        .run(env)

      expect(result).toEqual(left("some error"))
    })

    it("short circuits scoped computations when using function", async () => {
      const result = await success(3)
        .into("x")
        .do(() => failure("some error"))
        .return(() => throwUnexpectedCall)
        .run(env)

      expect(result).toEqual(left("some error"))
    })

    it("short circuits scoped computations with effects", async () => {
      const result = await success(3)
        .into("x")
        .do(failure("some error"))
        .return(() => throwUnexpectedCall)
        .run(env)

      expect(result).toEqual(left("some error"))
    })

    it("short circuits multiple scoped computations", async () => {
      const result = await success(23)
        .into("x")
        .for("ys", ({ x }) => range(0, x).map(i => (i === 3 ? failure("some error") : success(1))))
        .return(() => throwUnexpectedCall)
        .run(env)

      expect(result).toEqual(left("some error"))
    })
  })
})
