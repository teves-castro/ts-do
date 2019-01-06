import { left, right } from "fp-ts/lib/Either"
import { fromEither, IOEither } from "fp-ts/lib/IOEither"
import { range, sum } from "ramda"
import "../src/index"

const throwUnexpectedCall = () => {
  throw new Error("Unexpected call")
}

describe("Do/Let/Return", () => {
  describe("for IOEither", () => {
    const success: <R>(r: R) => IOEither<string, R> = r => fromEither(right(r))
    const failure: (l: string) => IOEither<string, never> = l => fromEither(left(l))

    it("chains scoped computations when using value", async () => {
      const result = success(10)
        .into("x")
        .let("y", success(5))
        .return(({ x, y }) => x - y)

      await result.fold(throwUnexpectedCall, r => expect(r).toEqual(5)).run()
    })

    it("chains scoped computations when using function", async () => {
      const result = success(3)
        .into("x")
        .let("y", ({ x }) => success(x.toString()))
        .return(({ x, y }) => y + x)

      await result.fold(throwUnexpectedCall, r => expect(r).toEqual("33")).run()
    })

    it("chains scoped computations with effects", async () => {
      const result = success(10)
        .into("x")
        .do(success(undefined))
        .let("y", success(5))
        .return(({ x, y }) => x - y)

      await result.fold(throwUnexpectedCall, r => expect(r).toEqual(5)).run()
    })

    it("chains multiple scoped computations", async () => {
      const result = success(23)
        .into("x")
        .for("ys", ({ x }) => range(0, x).map(() => success(1)))
        .return(({ x, ys }) => x - sum(ys))

      await result.fold(throwUnexpectedCall, r => expect(r).toEqual(0)).run()
    })

    it("short circuits scoped computations when using value", async () => {
      const result = success(3)
        .into("x")
        .do(failure("some error"))
        .return(() => throwUnexpectedCall)

      await result.fold(message => expect(message).toBe("some error"), throwUnexpectedCall).run()
    })

    it("short circuits scoped computations when using function", async () => {
      const result = success(3)
        .into("x")
        .do(failure("some error"))
        .return(() => throwUnexpectedCall)

      await result.fold(message => expect(message).toBe("some error"), throwUnexpectedCall).run()
    })

    it("short circuits scoped computations with effects", async () => {
      const result = success(3)
        .into("x")
        .do(failure("some error"))
        .return(() => throwUnexpectedCall)

      await result.fold(message => expect(message).toBe("some error"), throwUnexpectedCall).run()
    })

    it("short circuits multiple scoped computations", async () => {
      const result = success(23)
        .into("x")
        .for("ys", ({ x }) => range(0, x).map(i => (i === 3 ? failure("some error") : success(1))))
        .return(() => throwUnexpectedCall)

      await result.fold(e => expect(e).toEqual("some error"), throwUnexpectedCall).run()
    })
  })
})
