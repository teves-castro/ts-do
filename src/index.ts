import * as array from "fp-ts/lib/Array"
import { Left, Right } from "fp-ts/lib/Either"
import * as either from "fp-ts/lib/Either"
import { HKTAs } from "fp-ts/lib/HKT"
import { HKTS } from "fp-ts/lib/HKT"
import { HKT2S } from "fp-ts/lib/HKT"
import { HKT2As } from "fp-ts/lib/HKT"
import { Monad } from "fp-ts/lib/Monad"
import * as option from "fp-ts/lib/Option"
import { None, Some } from "fp-ts/lib/Option"
import { Task } from "fp-ts/lib/Task"
import * as task from "fp-ts/lib/Task"
import { TaskEither } from "fp-ts/lib/TaskEither"
import * as taskEither from "fp-ts/lib/TaskEither"
import { sequence, Traversable } from "fp-ts/lib/Traversable"

function makeLet<M extends HKT2S>(
  M: Monad<M>,
): <N extends string, L, RA, RB>(
  name: N,
  other: HKT2As<M, L, RB> | ((a: RA) => HKT2As<M, L, RB>),
) => HKT2As<M, L, RA & { [K in N]: RB }>

function makeLet<M extends HKTS>(
  M: Monad<M>,
): <N extends string, A, B>(name: N, other: HKTAs<M, B> | ((a: A) => HKTAs<M, B>)) => HKTAs<M, A & { [K in N]: B }>

function makeLet(M: Monad<any>) {
  return function<N extends string, A, B>(name: N, other: HKTAs<any, B> | ((a: A) => HKTAs<any, B>)) {
    return this.chain((previous: any) =>
      (typeof other === "function" ? other(previous) : other).map((state: any) => ({ ...previous, [name]: state })),
    )
  }
}

function makeFor<T extends HKTS, M extends HKT2S>(
  M: Monad<M>,
  T: Traversable<T>,
): <N extends string, L, RA, RB>(
  name: N,
  others: HKTAs<T, HKT2As<M, L, RB>> | ((a: RA) => HKTAs<T, HKT2As<M, L, RB>>),
) => HKT2As<M, L, RA & { [K in N]: HKTAs<T, RB> }>

function makeFor<T extends HKTS, M extends HKTS>(
  M: Monad<M>,
  T: Traversable<T>,
): <N extends string, A, B>(
  name: N,
  other: HKTAs<T, HKTAs<M, B>> | ((a: A) => HKTAs<T, HKTAs<M, B>>),
) => HKTAs<M, A & { [K in N]: HKTAs<T, B> }>

function makeFor<M extends HKTS, T extends HKTS>(M: Monad<any>, T: Traversable<T>) {
  const seq = sequence(M, T)
  return function<N extends string, A, B>(name: N, others: HKTAs<T, HKTAs<M, B>> | ((a: A) => HKTAs<T, HKTAs<M, B>>)) {
    return this.chain((previous: any) => {
      const os = typeof others === "function" ? others(previous) : others
      return seq(os).map((values: HKTAs<T, B>) => ({ ...previous, [name]: values }))
    })
  }
}

// tslint:disable:no-shadowed-variable
declare module "fp-ts/lib/Option" {
  interface None<A> {
    let<N extends string, B>(name: N, other: Option<B> | ((a: A) => Option<B>)): Option<A & { [K in N]: B }>
    for<N extends string, B>(
      name: N,
      others: ReadonlyArray<Option<B>> | ((a: A) => ReadonlyArray<Option<B>>),
    ): Option<A & { [K in N]: B[] }>
    return<B>(f: (a: A) => B): Option<B>
  }
  interface Some<A> {
    let<N extends string, B>(name: N, other: Option<B> | ((a: A) => Option<B>)): Option<A & { [K in N]: B }>
    for<N extends string, B>(
      name: N,
      others: ReadonlyArray<Option<B>> | ((a: A) => ReadonlyArray<Option<B>>),
    ): Option<A & { [K in N]: B[] }>
    return<B>(f: (a: A) => B): Option<B>
  }
}
None.prototype.let = function() {
  return this
}
None.prototype.for = function() {
  return this
}
Some.prototype.let = makeLet(option)
Some.prototype.for = makeFor(option, array)
None.prototype.return = None.prototype.map
Some.prototype.return = Some.prototype.map

declare module "fp-ts/lib/Either" {
  interface Left<L, A> {
    let<N extends string, B>(name: N, other: Either<L, B> | ((a: A) => Either<L, B>)): Either<L, A & { [K in N]: B }>
    for<N extends string, B>(
      name: N,
      others: ReadonlyArray<Either<L, B>> | ((a: A) => ReadonlyArray<Either<L, B>>),
    ): Either<L, A & { [K in N]: ReadonlyArray<B> }>
    return<B>(f: (a: A) => B): Either<L, B>
  }
  interface Right<L, A> {
    let<N extends string, B>(name: N, other: Either<L, B> | ((a: A) => Either<L, B>)): Either<L, A & { [K in N]: B }>
    for<N extends string, B>(
      name: N,
      others: ReadonlyArray<Either<L, B>> | ((a: A) => ReadonlyArray<Either<L, B>>),
    ): Either<L, A & { [K in N]: ReadonlyArray<B> }>
    return<B>(f: (a: A) => B): Either<L, B>
  }
}
Left.prototype.let = function() {
  return this
}
Left.prototype.for = function() {
  return this
}
Right.prototype.let = makeLet(either)
Right.prototype.for = makeFor(either, array)
Left.prototype.return = Left.prototype.map
Right.prototype.return = Right.prototype.map

declare module "fp-ts/lib/Task" {
  interface Task<A> {
    let<N extends string, B>(name: N, other: Task<B> | ((a: A) => Task<B>)): Task<A & { [K in N]: B }>
    for<N extends string, B>(
      name: N,
      others: ReadonlyArray<Task<B>> | ((a: A) => ReadonlyArray<Task<B>>),
    ): Task<A & { [K in N]: ReadonlyArray<B> }>
    return<B>(f: (a: A) => B): Task<B>
  }
}
Task.prototype.let = makeLet(task)
Task.prototype.for = makeFor(task, array)
Task.prototype.return = Task.prototype.map

declare module "fp-ts/lib/TaskEither" {
  interface TaskEither<L, A> {
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
TaskEither.prototype.let = makeLet(taskEither)
TaskEither.prototype.for = makeFor(taskEither, array)
TaskEither.prototype.return = TaskEither.prototype.map
