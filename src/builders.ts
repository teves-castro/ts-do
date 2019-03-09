import { HKT, Type, Type2, Type3, URIS, URIS2, URIS3 } from "fp-ts/lib/HKT"
import { Monad } from "fp-ts/lib/Monad"
import { sequence, Traversable } from "fp-ts/lib/Traversable"

export type Step<M extends URIS, A, B> = Type<M, A> | ((a: A) => Type<M, B>)
export type Step2<M extends URIS2, L, RA, RB> = Type2<M, L, RB> | ((a: RA) => Type2<M, L, RB>)
export type Step3<M extends URIS3, E, L, RA, RB> = Type3<M, E, L, RB> | ((a: RA) => Type3<M, E, L, RB>)

export type Steps<T extends URIS, M extends URIS, A, B> = Type<T, Type<M, B>> | ((a: A) => Type<T, Type<M, B>>)
export type Steps2<T extends URIS, M extends URIS2, L, RA, RB> =
  | Type<T, Type2<M, L, RB>>
  | ((a: RA) => Type<T, Type2<M, L, RB>>)
export type Steps3<T extends URIS, M extends URIS3, E, L, RA, RB> =
  | Type<T, Type3<M, E, L, RB>>
  | ((a: RA) => Type<T, Type3<M, E, L, RB>>)

export type Context<M extends URIS, N extends string, A, B> = Type<M, A & { [K in N]: B }>
export type Context2<M extends URIS2, N extends string, L, RA, RB> = Type2<M, L, RA & { [K in N]: RB }>
export type Context3<M extends URIS3, N extends string, E, L, RA, RB> = Type3<M, E, L, RA & { [K in N]: RB }>

export type Do<M extends URIS> = <A>(other: Step<M, A, void>) => Type<M, A>
export type Do2<M extends URIS2> = <L, R>(other: Step2<M, L, R, void>) => Type2<M, L, R>
export type Do3<M extends URIS3> = <E, L, R>(other: Step3<M, E, L, R, void>) => Type3<M, E, L, R>

export function makeDo<M extends URIS3>(M: Monad<M>): Do3<M>
export function makeDo<M extends URIS2>(M: Monad<M>): Do2<M>
export function makeDo<M extends URIS>(M: Monad<M>): Do<M>
export function makeDo<M extends URIS>(M: Monad<M>) {
  return function<A>(other: Step<M, A, any>) {
    const self = this as HKT<M, A>
    return M.chain(self, (previous: A) =>
      M.map((other instanceof Function ? other(previous) : other) as HKT<any, void>, () => previous),
    )
  }
}

export type Into<M extends URIS> = <N extends string, A>(name: N) => Context<M, N, void, A>
export type Into2<M extends URIS2> = <N extends string, L, R>(name: N) => Context2<M, N, L, void, R>
export type Into3<M extends URIS3> = <N extends string, E, L, R>(name: N) => Context3<M, N, E, L, void, R>
export type Let<M extends URIS> = <N extends string, A, B>(name: N, other: Step<M, A, B>) => Context<M, N, A, B>
export type Let2<M extends URIS2> = <N extends string, L, RA, RB>(
  name: N,
  other: Step2<M, L, RA, RB>,
) => Context2<M, N, L, RA, RB>
export type Let3<M extends URIS3> = <N extends string, E, L, RA, RB>(
  name: N,
  other: Step3<M, E, L, RA, RB>,
) => Context3<M, N, E, L, RA, RB>

export function makeLet<M extends URIS>(M: Monad<M>): Into<M>
export function makeLet<M extends URIS2>(M: Monad<M>): Into2<M>
export function makeLet<M extends URIS3>(M: Monad<M>): Into3<M>
export function makeLet<M extends URIS>(M: Monad<M>): Let<M>
export function makeLet<M extends URIS2>(M: Monad<M>): Let2<M>
export function makeLet<M extends URIS3>(M: Monad<M>): Let3<M>
export function makeLet<M extends URIS>(M: Monad<M>) {
  return function<N extends string>(name: N, other: any) {
    const self = this
    if (other) {
      return M.chain(self, previous =>
        M.map(other instanceof Function ? other(previous) : other, value =>
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
export type For3<T extends URIS, M extends URIS3> = <N extends string, E, L, RA, RB>(
  name: N,
  others: Steps3<T, M, E, L, RA, RB>,
) => Context3<M, N, E, L, RA, Type<T, RB>>

export function makeFor<T extends URIS, M extends URIS3>(M: Monad<M>, T: Traversable<T>): For3<T, M>
export function makeFor<T extends URIS, M extends URIS2>(M: Monad<M>, T: Traversable<T>): For2<T, M>
export function makeFor<T extends URIS, M extends URIS>(M: Monad<M>, T: Traversable<T>): For<T, M>
export function makeFor<T extends URIS, M extends URIS>(M: Monad<M>, T: Traversable<T>) {
  const seq = sequence(M, T)
  return function<N extends string>(name: N, others: any) {
    const self = this
    return M.chain(self, previous => {
      const os = others instanceof Function ? others(previous) : others
      return M.map(seq(os), values => Object.assign({}, previous, { [name]: values }))
    })
  }
}
