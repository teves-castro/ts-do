import { array } from "fp-ts/lib/Array"
import { either, Left, Right } from "fp-ts/lib/Either"
import { makeDo, makeFor, makeLet } from "./builders"

declare module "fp-ts/lib/Either" {
  interface Left<L, A> {
    do(other: Either<L, void> | ((a: A) => Either<L, void>)): Either<L, A>
    into<N extends string>(name: N): Either<L, { [K in N]: A }>
    let<N extends string, B>(name: N, other: Either<L, B> | ((a: A) => Either<L, B>)): Either<L, A & { [K in N]: B }>
    for<N extends string, B>(
      name: N,
      others: ReadonlyArray<Either<L, B>> | ((a: A) => ReadonlyArray<Either<L, B>>),
    ): Either<L, A & { [K in N]: ReadonlyArray<B> }>
    return<B>(f: (a: A) => B): Either<L, B>
  }
  interface Right<L, A> {
    do(other: Either<L, void> | ((a: A) => Either<L, void>)): Either<L, A>
    into<N extends string>(name: N): Either<L, { [K in N]: A }>
    let<N extends string, B>(name: N, other: Either<L, B> | ((a: A) => Either<L, B>)): Either<L, A & { [K in N]: B }>
    for<N extends string, B>(
      name: N,
      others: ReadonlyArray<Either<L, B>> | ((a: A) => ReadonlyArray<Either<L, B>>),
    ): Either<L, A & { [K in N]: ReadonlyArray<B> }>
    return<B>(f: (a: A) => B): Either<L, B>
  }
}
Left.prototype.do = function() {
  return this
}
Left.prototype.into = function() {
  return this
}
Left.prototype.let = function() {
  return this
}
Left.prototype.for = function() {
  return this
}
Right.prototype.do = makeDo(either)
Right.prototype.into = makeLet(either)
Right.prototype.let = makeLet(either)
Right.prototype.for = makeFor(either, array)
Left.prototype.return = Left.prototype.map
Right.prototype.return = Right.prototype.map
