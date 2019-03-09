import { array } from "fp-ts/lib/Array"
import { readerTaskEither, ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither"
import { makeDo, makeFor, makeLet } from "./builders"

declare module "fp-ts/lib/ReaderTaskEither" {
  interface ReaderTaskEither<E, L, A> {
    do(other: ReaderTaskEither<E, L, void> | ((a: A) => ReaderTaskEither<E, L, void>)): ReaderTaskEither<E, L, A>
    into<N extends string>(name: N): ReaderTaskEither<E, L, { [K in N]: A }>
    let<N extends string, B>(
      name: N,
      other: ReaderTaskEither<E, L, B> | ((a: A) => ReaderTaskEither<E, L, B>),
    ): ReaderTaskEither<E, L, A & { [K in N]: B }>
    for<N extends string, B>(
      name: N,
      others: ReadonlyArray<ReaderTaskEither<E, L, B>> | ((a: A) => ReadonlyArray<ReaderTaskEither<E, L, B>>),
    ): ReaderTaskEither<E, L, A & { [K in N]: ReadonlyArray<B> }>
    return<B>(f: (a: A) => B): ReaderTaskEither<E, L, B>
  }
}
ReaderTaskEither.prototype.do = makeDo(readerTaskEither)
ReaderTaskEither.prototype.into = makeLet(readerTaskEither)
ReaderTaskEither.prototype.let = makeLet(readerTaskEither)
ReaderTaskEither.prototype.for = makeFor(readerTaskEither, array)
ReaderTaskEither.prototype.return = ReaderTaskEither.prototype.map

export const readerTaskEitherModule = "readerTaskEither"
