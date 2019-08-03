import { array } from "fp-ts/lib/Array"
import { map, none, option, some } from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { range, sum } from "ramda"
import * as Do from "../src/index"

const bind = Do.bind(option)
const into = Do.into(option)
const exec = Do.exec(option)
const sequence = Do.sequence(array, option)

const throwUnexpectedCall = () => {
  throw new Error("Unexpected call")
}

describe("Do/Let/Return", () => {
  describe("for option", () => {
    it("chains scoped computations which perform effects", () => {
      const result = pipe(
        some(23),
        into("x"),
        exec(() => some(undefined)),
        bind("y", some(23)),
        map(({ x, y }) => x - y),
      )

      expect(result).toEqual(some(0))
    })

    it("chains scoped computations", () => {
      const result = pipe(
        some(23),
        into("x"),
        bind("y", some(23)),
        map(({ x, y }) => x - y),
      )

      expect(result).toEqual(some(0))
    })

    it("chains scoped computations", () => {
      const result = pipe(
        some(23),
        into("x"),
        bind("y", ({ x }) => some(x)),
        map(({ x, y }) => x - y),
      )

      expect(result).toEqual(some(0))
    })

    it("chains multiple scoped computations", () => {
      const result = pipe(
        some(3),
        into("x"),
        sequence("ys", ({ x }) => range(0, x).map(() => some(1))),
        map(({ x, ys }) => x - sum(ys)),
      )

      expect(result).toEqual(some(0))
    })

    it("short circuits multiple scoped computations", () => {
      const result = pipe(
        some(3),
        into("x"),
        sequence("ys", () => [some(1), none, some(2)]),
        map(({ x, ys }) => x - sum(ys)),
      )

      expect(result).toEqual(none)
    })

    it("short circuits computations", () => {
      const result = pipe(
        some(10),
        into("x"),
        exec(() => none),
        map(throwUnexpectedCall),
      )

      expect(result).toEqual(none)
    })

    it("short circuits none.do", () => {
      const result = pipe(
        none,
        exec(() => some(undefined)),
        map(throwUnexpectedCall),
      )

      expect(result).toEqual(none)
    })

    it("short circuits none.into", () => {
      const result = pipe(
        none,
        into("x"),
        map(throwUnexpectedCall),
      )

      expect(result).toEqual(none)
    })

    it("short circuits none.let", () => {
      const result = pipe(
        none,
        bind("x", some(10)),
        map(throwUnexpectedCall),
      )

      expect(result).toEqual(none)
    })

    it("short circuits none.for", () => {
      const result = pipe(
        none,
        sequence("ys", throwUnexpectedCall),
        map(throwUnexpectedCall),
      )

      expect(result).toEqual(none)
    })

    it("short circuits computations with effects", () => {
      const result = pipe(
        some(10),
        into("x"),
        exec(() => none),
        map(throwUnexpectedCall),
      )

      expect(result).toEqual(none)
    })
  })
})
