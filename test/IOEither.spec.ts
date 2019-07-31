import { array } from "fp-ts/lib/Array"
import { ioEither, left, map, right } from "fp-ts/lib/IOEither"
import { pipe } from "fp-ts/lib/pipeable"
import { range, sum } from "ramda"
import * as Do from "../src/index"

const bind = Do.bind(ioEither)
const into = Do.into(ioEither)
const exec = Do.exec(ioEither)
const sequence = Do.parallel(array, ioEither)

const throwUnexpectedCall = () => {
  throw new Error("Unexpected call")
}

describe("Do/Let/Return", () => {
  describe("for IOEither", () => {
    it("chains scoped computations when using value", async () => {
      const result = pipe(
        right(10),
        into("x"),
        bind("y", () => right(5)),
        map(({ x, y }) => x - y),
      )

      expect(result()).toEqual(right(5)())
    })

    it("chains scoped computations when using function", async () => {
      const result = pipe(
        right(3),
        into("x"),
        bind("y", ({ x }) => right(x.toString())),
        map(({ x, y }) => y + x),
      )

      expect(result()).toEqual(right("33")())
    })

    it("chains scoped computations with effects", async () => {
      const result = pipe(
        right(10),
        into("x"),
        exec(() => right(undefined)),
        bind("y", () => right(5)),
        map(({ x, y }) => x - y),
      )

      expect(result()).toEqual(right(5)())
    })

    it("chains multiple scoped computations", async () => {
      const result = pipe(
        right(23),
        into("x"),
        sequence("ys", ({ x }) => range(0, x).map(() => right(1))),
        map(({ x, ys }) => x - sum(ys)),
      )

      expect(result()).toEqual(right(0)())
    })

    it("short circuits scoped computations when using value", async () => {
      const result = pipe(
        right(3),
        into("x"),
        exec(() => left("some error")),
        map(throwUnexpectedCall),
      )

      expect(result()).toEqual(left("some error")())
    })

    it("short circuits scoped computations when using function", async () => {
      const result = pipe(
        right(3),
        into("x"),
        exec(() => left("some error")),
        map(throwUnexpectedCall),
      )

      expect(result()).toEqual(left("some error")())
    })

    it("short circuits scoped computations with effects", async () => {
      const result = pipe(
        right(3),
        into("x"),
        exec(() => left("some error")),
        map(throwUnexpectedCall),
      )

      expect(result()).toEqual(left("some error")())
    })

    it("short circuits multiple scoped computations", async () => {
      const result = pipe(
        right(23),
        into("x"),
        sequence("ys", ({ x }) =>
          range(0, x).map(i => (i === 3 ? left("some error") : right(1))),
        ),
        map(throwUnexpectedCall),
      )

      expect(result()).toEqual(left("some error")())
    })
  })
})
