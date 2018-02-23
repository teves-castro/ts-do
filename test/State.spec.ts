import { constant } from "fp-ts/lib/function"
import { state } from "fp-ts/lib/State"
import { get, modify, put } from "fp-ts/lib/State"
import "../src/State"

describe("Do/Let/Return", () => {
  describe("for State", () => {
    it("chains scoped computations which perform effects", () => {
      const inc = (n: number) => n + 1

      const result = state
        .of<number, string>("Hello")
        .into("x")
        .do(modify(inc))
        .let("y", get<number>())
        .do(put(42))
        .let("z", get<number>())

      const expected = state
        .of<number, string>("Hello")
        .chain(x => modify(inc).map(constant({ x })))
        .chain(ctx => get<number>().map(y => ({ ...ctx, y })))
        .chain(ctx => put(42).map(constant(ctx)))
        .chain(ctx => get<number>().map(z => ({ ...ctx, z })))

      expect(result.run(1)).toEqual(expected.run(1))
    })
  })
})
