import { array } from "fp-ts/lib/Array"
import { task, Task } from "fp-ts/lib/Task"
import { makeDo, makeFor, makeLet } from "./builders"

declare module "fp-ts/lib/Task" {
  interface Task<A> {
    do(other: Task<any> | ((a: A) => Task<any>)): Task<A>
    into<N extends string>(name: N): Task<{ [K in N]: A }>
    let<N extends string, B>(name: N, other: Task<B> | ((a: A) => Task<B>)): Task<A & { [K in N]: B }>
    for<N extends string, B>(
      name: N,
      others: ReadonlyArray<Task<B>> | ((a: A) => ReadonlyArray<Task<B>>),
    ): Task<A & { [K in N]: ReadonlyArray<B> }>
    return<B>(f: (a: A) => B): Task<B>
  }
}
Task.prototype.do = makeDo(task)
Task.prototype.into = makeLet(task)
Task.prototype.let = makeLet(task)
Task.prototype.for = makeFor(task, array)
Task.prototype.return = Task.prototype.map

export const taskModule = "task"
