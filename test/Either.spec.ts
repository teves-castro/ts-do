import { array } from "fp-ts/lib/Array"
import { either, left, map, right } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { range, sum } from "ramda"
import * as Do from "../src/index"

const bind = Do.bind(either)
const into = Do.into(either)
const exec = Do.exec(either)
const sequence = Do.sequence(array, either)

const throwUnexpectedCall = () => {
  throw new Error("Unexpected call")
}

describe("Do/Let/Return", () => {
  describe("for either", () => {
    it("chains scoped computations which perform effects", () => {
      const result = pipe(
        right(10),
        into("x"),
        bind("y", ({ x }) => right(x - 5)),
        exec(() => right(undefined)),
        map(({ x, y }) => x - y),
      )

      expect(result).toEqual(right(5))
    })

    it("chains scoped computations", () => {
      const result = pipe(
        right(10),
        into("x"),
        bind("y", ({ x }) => right(x - 5)),
        map(({ x, y }) => x - y),
      )

      expect(result).toEqual(right(5))
    })

    it("chains multiple scoped computations", () => {
      const result = pipe(
        right(23),
        into("x"),
        sequence("ys", ({ x }) => range(0, x).map(() => right(1))),
        map(({ x, ys }) => x - sum(ys)),
      )

      expect(result).toEqual(right(0))
    })

    it("short circuits multiple scoped computations", () => {
      const result = pipe(
        right(23),
        into("x"),
        sequence("ys", ({ x }) =>
          range(0, x).map(i => (i === 3 ? left("some error") : right(1))),
        ),
        map(() => throwUnexpectedCall),
      )

      expect(result).toEqual(left("some error"))
    })

    it("short circuits scoped computations", () => {
      const result = pipe(
        right(10),
        into("x"),
        exec(() => left("some error")),
        map(throwUnexpectedCall),
      )

      expect(result).toEqual(left("some error"))
    })

    it("short circuits left.do", () => {
      const result = pipe(
        left("some error"),
        exec(() => right(undefined)),
        map(throwUnexpectedCall),
      )

      expect(result).toEqual(left("some error"))
    })

    it("short circuits left.into", () => {
      const result = pipe(
        left("some error"),
        into("x"),
        map(throwUnexpectedCall),
      )

      expect(result).toEqual(left("some error"))
    })

    it("short circuits left.let", () => {
      const result = pipe(
        left("some error"),
        bind("x", () => right(10)),
        map(throwUnexpectedCall),
      )

      expect(result).toEqual(left("some error"))
    })

    it("short circuits left.for", () => {
      const result = pipe(
        left("some error"),
        sequence("ys", throwUnexpectedCall),
        map(throwUnexpectedCall),
      )

      expect(result).toEqual(left("some error"))
    })

    it("short circuits scoped computations with effects", () => {
      const result = pipe(
        right(10),
        into("x"),
        exec(() => left("some error")),
        map(throwUnexpectedCall),
      )

      expect(result).toEqual(left("some error"))
    })
  })
})
