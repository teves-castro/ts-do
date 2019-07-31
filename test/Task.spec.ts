import { array, getMonoid } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/pipeable"
import { delay, map, of, task, Task } from "fp-ts/lib/Task"
import { range } from "ramda"
import * as Do from "../src/index"

const bind = Do.bind(task)
const into = Do.into(task)
const exec = Do.exec(task)
export const parallel = Do.parallel(array, task)
export const sequence = Do.sequence(array, task, getMonoid<any>())

export const log: (m: string) => <T>(t: Task<T>) => Task<T> = m => t =>
  task.map(t, tv => (console.log(`${m} -> ${tv}`), tv))

export const randomDelay = (m: string = "") => <T>(t: T) =>
  pipe(
    of(t),
    delay(Math.random() * 200),
    log(m),
  )

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

    it.only("chains multiple scoped computations", async () => {
      const result = pipe(
        of(23000),
        into("x"),
        // sequence("is", ({ x }) => range(0, x).map(randomDelay("s"))),
        // parallel("ys", ({ x }) => range(0, x).map(randomDelay("p"))),
        sequence("is", ({ x }) => range(0, x).map(i => task.of(i))),
        parallel("ys", ({ x }) => range(0, x).map(i => task.of(i))),
        exec(({ x, ys }) => task.of(expect(ys).toEqual(range(0, x)))),
      )

      const r = await result()
      console.log(r)
      // expect(r).toEqual(range(0, 23))
    })
  })
})
