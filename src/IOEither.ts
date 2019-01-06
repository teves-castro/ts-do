import { array } from "fp-ts/lib/Array"
import { ioEither, IOEither } from "fp-ts/lib/IOEither"
import { makeDo, makeFor, makeLet } from "./builders"

declare module "fp-ts/lib/IOEither" {
  interface IOEither<L, A> {
    do(other: IOEither<L, any> | ((a: A) => IOEither<L, any>)): IOEither<L, A>
    into<N extends string>(name: N): IOEither<L, { [K in N]: A }>
    let<N extends string, B>(
      name: N,
      other: IOEither<L, B> | ((a: A) => IOEither<L, B>),
    ): IOEither<L, A & { [K in N]: B }>
    for<N extends string, B>(
      name: N,
      others: ReadonlyArray<IOEither<L, B>> | ((a: A) => ReadonlyArray<IOEither<L, B>>),
    ): IOEither<L, A & { [K in N]: ReadonlyArray<B> }>
    return<B>(f: (a: A) => B): IOEither<L, B>
  }
}
IOEither.prototype.do = makeDo(ioEither)
IOEither.prototype.into = makeLet(ioEither)
IOEither.prototype.let = makeLet(ioEither)
IOEither.prototype.for = makeFor(ioEither, array)
IOEither.prototype.return = IOEither.prototype.map

export const ioEitherModule = "taskEither"
