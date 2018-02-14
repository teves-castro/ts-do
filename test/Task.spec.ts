import { Task } from "fp-ts/lib/Task"
import { range, sum } from "ramda"
import "../src/index"

describe("Do/Let/Return", () => {
  describe("for task", () => {
    const delayValue = <T>(d: number, v: T) =>
      new Task(() => new Promise<T>(resolve => setTimeout(() => resolve(v), d)))

    it("chains scoped computations", async () => {
      const result = delayValue(100, 23)
        .into("x")
        .let("y", delayValue(200, 10))
        .return(({ x, y }) => x - y)

      expect(await result.run()).toEqual(13)
    })

    it("chains scoped computations with effects", async () => {
      const result = delayValue(100, 23)
        .into("x")
        .do(delayValue(100, undefined))
        .let("y", delayValue(200, 10))
        .return(({ x, y }) => x - y)

      expect(await result.run()).toEqual(13)
    })

    it("chains multiple scoped computations", async () => {
      const result = delayValue(10, 23)
        .into("x")
        .for("ys", ({ x }) => range(0, x).map(() => delayValue(10, 1)))
        .return(({ x, ys }) => x - sum(ys))

      expect(await result.run()).toEqual(0)
    })
  })
})
