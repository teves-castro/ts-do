import { left, right } from "fp-ts/lib/Either"
import { range, sum } from "ramda"
import "../src/index"

const throwUnexpectedCall = () => {
  throw new Error("Unexpected call")
}

describe("Do/Let/Return", () => {
  describe("for either", () => {
    it("chains scoped computations which perform effects", () => {
      const result = right(10)
        .into("x")
        .do(right<string, void>(undefined))
        .let("y", ({ x }) => right(x - 5))
        .return(({ x, y }) => x - y)

      expect(result).toEqual(right(5))
    })

    it("chains scoped computations", () => {
      const result = right(10)
        .into("x")
        .let("y", ({ x }) => right(x - 5))
        .return(({ x, y }) => x - y)

      expect(result).toEqual(right(5))
    })

    it("chains multiple scoped computations", () => {
      const result = right(23)
        .into("x")
        .for("ys", ({ x }) => range(0, x).map(() => right<string, number>(1)))
        .return(({ x, ys }) => x - sum(ys))

      expect(result).toEqual(right(0))
    })

    it("short circuits multiple scoped computations", () => {
      const result = right(23)
        .into("x")
        .for("ys", ({ x }) => range(0, x).map(i => (i === 3 ? left("some error") : right(1))))
        .return(() => throwUnexpectedCall)

      expect(result).toEqual(left("some error"))
    })

    it("short circuits scoped computations", () => {
      const result = right(10)
        .into("x")
        .do(() => left("some error"))
        .return(throwUnexpectedCall)

      expect(result).toEqual(left("some error"))
    })

    it("short circuits scoped computations with effects", () => {
      const result = right(10)
        .into("x")
        .do(() => left("some error"))
        .return(throwUnexpectedCall)

      expect(result).toEqual(left("some error"))
    })
  })
})
