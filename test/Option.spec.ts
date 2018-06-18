import { none, some } from "fp-ts/lib/Option"
import { range, sum } from "ramda"
import "../src/index"

const throwUnexpectedCall = () => {
  throw new Error("Unexpected call")
}

describe("Do/Let/Return", () => {
  describe("for option", () => {
    it("chains scoped computations which perform effects", () => {
      const result = some(23)
        .into("x")
        .do(some(undefined))
        .let("y", some(23))
        .return(({ x, y }) => x - y)

      expect(result).toEqual(some(0))
    })

    it("chains scoped computations", () => {
      const result = some(23)
        .into("x")
        .let("y", some(23))
        .return(({ x, y }) => x - y)

      expect(result).toEqual(some(0))
    })

    it("chains scoped computations", () => {
      const result = some(23)
        .into("x")
        .let("y", some(10))
        .return(({ x, y }) => x - y)

      expect(result).toEqual(some(13))
    })

    it("chains multiple scoped computations", () => {
      const result = some(3)
        .into("x")
        .for("ys", ({ x }) => range(0, x).map(() => some(1)))
        .return(({ x, ys }) => x - sum(ys))

      expect(result).toEqual(some(0))
    })

    it("short circuits multiple scoped computations", () => {
      const result = some(3)
        .into("x")
        .for("ys", [some(1), none, some(2)])
        .return(({ x, ys }) => x - sum(ys))

      expect(result).toEqual(none)
    })

    it("short circuits computations", () => {
      const result = some(10)
        .into("x")
        .do(none)
        .return(throwUnexpectedCall)

      expect(result).toEqual(none)
    })

    it("short circuits none.do", () => {
      const result = none.do(() => some(10)).return(throwUnexpectedCall)

      expect(result).toEqual(none)
    })

    it("short circuits none.into", () => {
      const result = none.into("x").return(throwUnexpectedCall)

      expect(result).toEqual(none)
    })

    it("short circuits none.let", () => {
      const result = none.let("x", some(10)).return(throwUnexpectedCall)

      expect(result).toEqual(none)
    })

    it("short circuits none.for", () => {
      const result = none.for("ys", throwUnexpectedCall).return(throwUnexpectedCall)

      expect(result).toEqual(none)
    })

    it("short circuits computations with effects", () => {
      const result = some(10)
        .into("x")
        .do(none)
        .return(throwUnexpectedCall)

      expect(result).toEqual(none)
    })
  })
})
