import { IO } from "fp-ts/lib/IO"
import { range } from "ramda"
import "../src/IO"

describe("Do/Let/Return", () => {
  describe("for task", () => {
    let log: string[] = []
    const read = (message: string) => new IO(() => message)
    const append = (message: string) =>
      new IO(() => {
        log.push(message)
      })
    const clear = () => (log = [])

    it("chains scoped computations", async () => {
      clear()

      await read("John Doe")
        .into("name")
        .do(({ name }) => append(`Hello ${name}!`))
        .do(append("Welcome!"))
        .run()

      expect(log).toEqual(["Hello John Doe!", "Welcome!"])
    })

    it("chains multiple scoped computations", async () => {
      clear()

      await append("Hello")
        .for("ys", range(0, 4).map(i => append(`${i + 1}`)))
        .run()

      expect(log).toEqual(["Hello", "1", "2", "3", "4"])
    })
  })
})
