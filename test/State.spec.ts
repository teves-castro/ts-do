import { state } from "fp-ts/lib/State"
import { get, modify, put } from "fp-ts/lib/State"
import "../src/State"

describe("Do/Let/Return", () => {
  describe("for either", () => {
    it("chains scoped computations which perform effects", () => {
      const inc = (n: number) => n + 1

      const result = state
        .of<number, string>("Hello")
        .into("x")
        .do(modify(inc))
        .let("y", get<number>())
        .do(put(42))
        .let("z", get<number>())

      expect(result.run(1)).toEqual([{ x: "Hello", y: 2, z: 42 }, 42])
    })
  })
})
