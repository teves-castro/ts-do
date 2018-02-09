import { left, right } from "fp-ts/lib/Either"
import { Either } from "fp-ts/lib/Either"
import { none, some } from "fp-ts/lib/Option"
import { Task } from "fp-ts/lib/Task"
import { fromEither, TaskEither } from "fp-ts/lib/TaskEither"
import { range, sum } from "ramda"
import "../src/index"

const throwUnexpectedCall = () => {
  throw new Error("Unexpected call")
}

describe("Let/Return", () => {
  describe("for option", () => {
    it("chains scoped computations", () => {
      const result = some({})
        .let("x", some(23))
        .let("y", some(23))
        .return(({ x, y }) => x - y)

      expect(result).toEqual(some(0))
    })

    it("chains scoped computations", () => {
      const result = some({})
        .let("x", some(23))
        .let("y", some(10))
        .return(({ x, y }) => x - y)

      expect(result).toEqual(some(13))
    })

    it("chains multiple scoped computations", () => {
      const result = some({})
        .let("x", some(3))
        .for("ys", ({ x }) => range(0, x).map(() => some(1)))
        .return(({ x, ys }) => x - sum(ys))

      expect(result).toEqual(some(0))
    })

    it("short circuits multiple scoped computations", () => {
      const result = some({})
        .let("x", some(3))
        .for("ys", [some(1), none, some(2)])
        .return(({ x, ys }) => x - sum(ys))

      expect(result).toEqual(none)
    })

    it("short circuits computations", () => {
      const result = some({})
        .let("x", some(10))
        .do(none)
        .return(throwUnexpectedCall)

      expect(result).toEqual(none)
    })
  })

  describe("for either", () => {
    it("chains scoped computations", () => {
      const result = right({})
        .let("x", right<string, number>(10))
        .let("y", () => right<string, number>(5))
        .return(({ x, y }) => x - y)

      expect(result).toEqual(right(5))
    })

    it("chains multiple scoped computations", () => {
      const result = right({})
        .let("x", right<string, number>(23))
        .for("ys", ({ x }) => range(0, x).map(() => right<string, number>(1)))
        .return(({ x, ys }) => x - sum(ys))

      expect(result).toEqual(right(0))
    })

    it("short circuits multiple scoped computations", () => {
      const result = right({})
        .let("x", right<string, number>(23))
        .for("ys", ({ x }) => range(0, x).map<Either<string, number>>(i => (i === 3 ? left("some error") : right(1))))
        .return(() => throwUnexpectedCall)

      expect(result).toEqual(left("some error"))
    })

    it("short circuits scoped computations", () => {
      const result = right({})
        .let("x", right(10))
        .do(() => left("some error"))
        .return(throwUnexpectedCall)

      expect(result).toEqual(left("some error"))
    })
  })

  describe("for task", () => {
    const delayValue = (d: number, v: number) =>
      new Task(() => {
        const p = new Promise<number>(resolve => {
          setTimeout(() => {
            resolve(v)
          }, d)
        })
        return p
      })

    it("chains scoped computations", async () => {
      const result = new Task(() => Promise.resolve({}))
        .let("x", delayValue(100, 23))
        .let("y", delayValue(200, 10))
        .return(({ x, y }) => x - y)

      expect(await result.run()).toEqual(13)
    })

    it("chains multiple scoped computations", async () => {
      const result = new Task(() => Promise.resolve({}))
        .let("x", delayValue(10, 23))
        .for("ys", ({ x }) => range(0, x).map(() => delayValue(10, 1)))
        .return(({ x, ys }) => x - sum(ys))

      expect(await result.run()).toEqual(0)
    })
  })

  describe("for TaskEither", () => {
    const success: <R>(r: R) => TaskEither<string, R> = r => fromEither(right(r))
    const failure: (l: string) => TaskEither<string, never> = l => fromEither(left(l))

    it("chains scoped computations when using value", async () => {
      const result = success({})
        .let("x", success(10))
        .let("y", success(5))
        .return(({ x, y }) => x - y)

      await result.fold(throwUnexpectedCall, r => expect(r).toEqual(5)).run()
    })

    it("chains scoped computations when using function", async () => {
      const result = success({})
        .let("x", success(3))
        .let("y", ({ x }) => success(x.toString()))
        .return(({ x, y }) => y + x)

      await result.fold(throwUnexpectedCall, r => expect(r).toEqual("33")).run()
    })

    it("chains multiple scoped computations", async () => {
      const result = success({})
        .let("x", success(23))
        .for("ys", ({ x }) => range(0, x).map(() => success(1)))
        .return(({ x, ys }) => x - sum(ys))

      await result.fold(throwUnexpectedCall, r => expect(r).toEqual(0)).run()
    })

    it("short circuits scoped computations when using value", async () => {
      const result = success({})
        .let("x", success(3))
        .do(failure("some error"))
        .do(throwUnexpectedCall)
        .return(() => throwUnexpectedCall)

      await result.fold(message => expect(message).toBe("some error"), throwUnexpectedCall).run()
    })

    it("short circuits scoped computations when using function", async () => {
      const result = success({})
        .let("x", success(3))
        .do(failure("some error"))
        .do(throwUnexpectedCall)
        .return(() => throwUnexpectedCall)

      await result.fold(message => expect(message).toBe("some error"), throwUnexpectedCall).run()
    })

    it("short circuits multiple scoped computations", async () => {
      const result = success({})
        .let("x", success(23))
        .for("ys", ({ x }) => range(0, x).map(i => (i === 3 ? failure("some error") : success(1))))
        .return(() => throwUnexpectedCall)

      await result.fold(e => expect(e).toEqual("some error"), throwUnexpectedCall).run()
    })
  })
})
