import { array } from "fp-ts/lib/Array"
import { io, IO } from "fp-ts/lib/IO"
import { makeDo, makeFor, makeLet } from "./builders"

declare module "fp-ts/lib/IO" {
  interface IO<A> {
    do(other: IO<void> | ((a: A) => IO<void>)): IO<A>
    into<N extends string>(name: N): IO<{ [K in N]: A }>
    let<N extends string, B>(name: N, other: IO<B> | ((a: A) => IO<B>)): IO<A & { [K in N]: B }>
    for<N extends string, B>(
      name: N,
      others: ReadonlyArray<IO<B>> | ((a: A) => ReadonlyArray<IO<B>>),
    ): IO<A & { [K in N]: ReadonlyArray<B> }>
    return<B>(f: (a: A) => B): IO<B>
  }
}
IO.prototype.do = makeDo(io)
IO.prototype.into = makeLet(io)
IO.prototype.let = makeLet(io)
IO.prototype.for = makeFor(io, array)
IO.prototype.return = IO.prototype.map

export const ioModule = "io"
