import { pipe } from "fp-ts/lib/pipeable"
import { get, map, modify, of, put, state } from "fp-ts/lib/State"
import * as Do from "../src/index"

const bind = Do.bind(state)
const into = Do.into(state)
const exec = Do.exec(state)

describe("Do/Let/Return", () => {
  describe("for State", () => {
    it("returns the same result as the equivalent chain pipeline", () => {
      const inc = (n: number) => n + 1

      const result = pipe(
        of<number, number>(1),
        into("x"),
        exec(() => modify(inc)),
        bind("y", () => get()),
        exec(() => put(42)),
        bind("z", () => get()),
        map(({ x, y, z }) => x + y + z),
      )(1)

      expect(result).toEqual([45, 42])
    })
  })
})
