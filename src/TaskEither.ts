import { array } from "fp-ts/lib/Array"
import { taskEither, TaskEither } from "fp-ts/lib/TaskEither"
import { makeDo, makeFor, makeLet } from "./builders"

declare module "fp-ts/lib/TaskEither" {
  interface TaskEither<L, A> {
    do(other: TaskEither<L, any> | ((a: A) => TaskEither<L, any>)): TaskEither<L, A>
    into<N extends string>(name: N): TaskEither<L, { [K in N]: A }>
    let<N extends string, B>(
      name: N,
      other: TaskEither<L, B> | ((a: A) => TaskEither<L, B>),
    ): TaskEither<L, A & { [K in N]: B }>
    for<N extends string, B>(
      name: N,
      others: ReadonlyArray<TaskEither<L, B>> | ((a: A) => ReadonlyArray<TaskEither<L, B>>),
    ): TaskEither<L, A & { [K in N]: ReadonlyArray<B> }>
    return<B>(f: (a: A) => B): TaskEither<L, B>
  }
}
TaskEither.prototype.do = makeDo(taskEither)
TaskEither.prototype.into = makeLet(taskEither)
TaskEither.prototype.let = makeLet(taskEither)
TaskEither.prototype.for = makeFor(taskEither, array)
TaskEither.prototype.return = TaskEither.prototype.map

export const taskEitherModule = "taskEither"
