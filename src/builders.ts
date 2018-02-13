import { HKT, Type, Type2, URIS, URIS2 } from "fp-ts/lib/HKT"
import { Monad } from "fp-ts/lib/Monad"
import { sequence, Traversable } from "fp-ts/lib/Traversable"

export type Step<M extends URIS, A, B> = Type<M, A> | ((a: A) => Type<M, B>)
export type Step2<M extends URIS2, L, RA, RB> = Type2<M, L, RB> | ((a: RA) => Type2<M, L, RB>)

export type Steps<T extends URIS, M extends URIS, A, B> = Type<T, Type<M, B>> | ((a: A) => Type<T, Type<M, B>>)
export type Steps2<T extends URIS, M extends URIS2, L, RA, RB> =
  | Type<T, Type2<M, L, RB>>
  | ((a: RA) => Type<T, Type2<M, L, RB>>)

export type Context<M extends URIS, N extends string, A, B> = Type<M, A & { [K in N]: B }>
export type Context2<M extends URIS2, N extends string, L, RA, RB> = Type2<M, L, RA & { [K in N]: RB }>

export type Do<M extends URIS> = <A>(other: Step<M, A, void>) => Type<M, A>
export type Do2<M extends URIS2> = <L, R>(other: Step2<M, L, R, void>) => Type2<M, L, R>

export function makeDo<M extends URIS>(M: Monad<M>): Do<M>
export function makeDo<M extends URIS2>(M: Monad<M>): Do2<M>
export function makeDo<M extends URIS>(M: Monad<M>) {
  return function<A>(other: Step<M, A, void>) {
    const self = this as HKT<M, A>
    return M.chain(self, (previous: A) =>
      M.map((typeof other === "function" ? other(previous) : other) as HKT<any, void>, () => previous),
    )
  }
}

export type Into<M extends URIS> = <N extends string, A>(name: N) => Context<M, N, void, A>
export type Into2<M extends URIS2> = <N extends string, L, R>(name: N) => Context2<M, N, L, void, R>
export type Let<M extends URIS> = <N extends string, A, B>(name: N, other: Step<M, A, B>) => Context<M, N, A, B>
export type Let2<M extends URIS2> = <N extends string, L, RA, RB>(
  name: N,
  other: Step2<M, L, RA, RB>,
) => Context2<M, N, L, RA, RB>

export function makeLet<M extends URIS>(M: Monad<M>): Into<M>
export function makeLet<M extends URIS2>(M: Monad<M>): Into2<M>
export function makeLet<M extends URIS>(M: Monad<M>): Let<M>
export function makeLet<M extends URIS2>(M: Monad<M>): Let2<M>
export function makeLet<M extends URIS>(M: Monad<M>) {
  return function<N extends string, A, B>(name: N, other: Step<M, A, B>) {
    const self = this as HKT<M, A>
    if (other) {
      return M.chain(self, previous =>
        M.map((typeof other === "function" ? other(previous) : other) as HKT<any, B>, value =>
          Object.assign({}, previous, { [name]: value }),
        ),
      )
    } else {
      return M.map(self, previous => ({ [name]: previous }))
    }
  }
}

export type For<T extends URIS, M extends URIS> = <N extends string, A, B>(
  name: N,
  others: Steps<T, M, A, B>,
) => Context<M, N, A, Type<T, B>>
export type For2<T extends URIS, M extends URIS2> = <N extends string, L, RA, RB>(
  name: N,
  others: Steps2<T, M, L, RA, RB>,
) => Context2<M, N, L, RA, Type<T, RB>>

export function makeFor<T extends URIS, M extends URIS2>(M: Monad<M>, T: Traversable<T>): For2<T, M>
export function makeFor<T extends URIS, M extends URIS>(M: Monad<M>, T: Traversable<T>): For<T, M>
export function makeFor<M extends URIS, T extends URIS>(M: Monad<M>, T: Traversable<T>) {
  const seq = sequence(M, T)
  return function<N extends string, A, B>(name: N, others: Type<T, Type<M, B>> | ((a: A) => Type<T, Type<M, B>>)) {
    const self = this as HKT<M, A>
    return M.chain(self, previous => {
      const os: HKT<any, HKT<any, B>> = typeof others === "function" ? others(previous) : others
      return M.map(seq(os), values => Object.assign({}, previous, { [name]: values }))
    })
  }
}
