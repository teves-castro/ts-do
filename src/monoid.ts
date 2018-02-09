// tslint:disable:no-shadowed-variable
// npm i gcanti/fp-ts#next

import { Monoid, monoidVoid } from "fp-ts/lib/Monoid"
import { getMonoid, Task, task } from "fp-ts/lib/Task"
import { createInterface } from "readline"
import "./index"

//
// helpers
//

export const getLine: Task<string> = new Task(
  () =>
    new Promise(resolve => {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      rl.question("", answer => {
        rl.close()
        resolve(answer)
      })
    }),
)

export const putStrLn = (message: string): Task<void> =>
  new Task(
    () =>
      new Promise(res => {
        res(console.log(message))
      }),
  )

//
// Blog post
//

export const programDo = putStrLn("What is your name?")
  .let("name", getLine)
  .do(putStrLn("What is your age?"))
  .let("age", getLine)
  .do(({ name }) => putStrLn(`Your name is ${name}`))
  .do(({ age }) => putStrLn(`Your age is ${age}`))

export const program = putStrLn("What is your name?")
  .chain(() => getLine)
  .chain(name =>
    putStrLn("What is your age?")
      .chain(() => getLine)
      .chain(age => putStrLn(`Your name is ${name}`).chain(() => putStrLn(`Your age is ${age}`))),
  )

programDo.run()

const name: Task<Task<void>> = putStrLn("What is your name?")
  .chain(() => getLine)
  .chain(name => task.of(putStrLn(`Your name is ${name}`)))

const age: Task<Task<void>> = putStrLn("What is your age?")
  .chain(() => getLine)
  .chain(age => task.of(putStrLn(`Your age is ${age}`)))

import { flatten } from "fp-ts/lib/Chain"

// runWizard: <A>(mma: Task<Task<A>>) => Task<A>
const runWizard = flatten(task)

const M: Monoid<Task<Task<void>>> = getMonoid(getMonoid(monoidVoid))

export const program2 = runWizard(M.concat(name, age))

// program2.run()

const prompt = (attribute: string): Task<Task<void>> =>
  putStrLn(`What is your ${attribute}?`)
    .chain(() => getLine)
    .chain(response => task.of(putStrLn(`Your ${attribute} is ${response}`)))

export const program3 = runWizard(M.concat(prompt("name"), prompt("age")))

// program3.run()

import { array } from "fp-ts/lib/Array"
import { foldMap } from "fp-ts/lib/Foldable"

export const program4 = runWizard(foldMap(array, M)(["name", "age", "favorite color", "sign"], prompt))

// program4.run()
