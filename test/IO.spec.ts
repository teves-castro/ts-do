import { array } from "fp-ts/lib/Array"
import { io, of } from "fp-ts/lib/IO"
import { pipe } from "fp-ts/lib/pipeable"
import { range } from "ramda"
import * as Do from "../src/index"

const into = Do.into(io)
const exec = Do.exec(io)
const sequence = Do.parallel(array, io)

describe("Do/Let/Return", () => {
  describe("for task", () => {
    let log: string[] = []
    const read = (message: string) => of(message)
    const append = (message: string) => of(log.push(message))
    const clear = () => (log = [])

    it("chains scoped computations", async () => {
      clear()

      pipe(
        read("John Doe"),
        into("name"),
        exec(({ name }) => append(`Hello ${name}!`)),
        exec(() => append("Welcome!")),
      )()

      expect(log).toEqual(["Hello John Doe!", "Welcome!"])
    })

    it("chains multiple scoped computations", async () => {
      clear()

      pipe(
        append("Hello"),
        sequence("ys", () => range(0, 4).map(i => append(`${i + 1}`))),
      )()

      expect(log).toEqual(["Hello", "1", "2", "3", "4"])
    })
  })
})
