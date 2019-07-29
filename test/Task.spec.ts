import { array } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/pipeable"
import { delay, map, of, task } from "fp-ts/lib/Task"
import { range, sum } from "ramda"
import * as Do from "../src/index"

const bind = Do.bind(task)
const into = Do.into(task)
const exec = Do.exec(task)
const sequence = Do.sequence(array, task)

describe("Do/Let/Return", () => {
  describe("for task", () => {
    it("chains scoped computations", async () => {
      const result = pipe(
        of(23),
        into("x"),
        bind("y", ({ x }) => delay(200)(of(10))),
        map(({ x, y }) => x - y),
      )

      expect(await result()).toEqual(13)
    })

    it("chains scoped computations with effects", async () => {
      const result = pipe(
        of(23),
        into("x"),
        exec(() => of(undefined)),
        bind("y", () => of(10)),
        map(({ x, y }) => x - y),
      )

      expect(await result()).toEqual(13)
    })

    it("chains multiple scoped computations", async () => {
      const result = pipe(
        of(23),
        into("x"),
        sequence("ys", ({ x }) => range(0, x).map(() => of(1))),
        map(({ x, ys }) => x - sum(ys)),
      )

      expect(await result()).toEqual(0)
    })
  })
})
