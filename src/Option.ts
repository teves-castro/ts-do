import { array } from "fp-ts/lib/Array"
import { option, None, Some } from "fp-ts/lib/Option"
import { makeDo, makeLet, makeFor } from "./builders"

// tslint:disable:no-shadowed-variable
declare module "fp-ts/lib/Option" {
  interface None<A> {
    do(other: Option<void> | ((a: A) => Option<void>)): Option<A>
    into<N extends string>(name: N): Option<A & { [K in N]: A }>
    let<N extends string, B>(name: N, other: Option<B> | ((a: A) => Option<B>)): Option<A & { [K in N]: B }>
    for<N extends string, B>(
      name: N,
      others: ReadonlyArray<Option<B>> | ((a: A) => ReadonlyArray<Option<B>>),
    ): Option<A & { [K in N]: B[] }>
    return<B>(f: (a: A) => B): Option<B>
  }
  interface Some<A> {
    do(other: Option<void> | ((a: A) => Option<void>)): Option<A>
    into<N extends string>(name: N): Option<A & { [K in N]: A }>
    let<N extends string, B>(name: N, other: Option<B> | ((a: A) => Option<B>)): Option<A & { [K in N]: B }>
    for<N extends string, B>(
      name: N,
      others: ReadonlyArray<Option<B>> | ((a: A) => ReadonlyArray<Option<B>>),
    ): Option<A & { [K in N]: B[] }>
    return<B>(f: (a: A) => B): Option<B>
  }
}
None.prototype.do = function() {
  return this
}
None.prototype.into = function() {
  return this
}
None.prototype.let = function() {
  return this
}
None.prototype.for = function() {
  return this
}
Some.prototype.do = makeDo(option)
Some.prototype.into = makeLet(option)
Some.prototype.let = makeLet(option)
Some.prototype.for = makeFor(option, array)
None.prototype.return = None.prototype.map
Some.prototype.return = Some.prototype.map
