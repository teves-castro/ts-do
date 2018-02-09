import { Type2, Type, URIS2, URIS } from "fp-ts/lib/HKT"
import { Monad } from "fp-ts/lib/Monad"
import { sequence, Traversable } from "fp-ts/lib/Traversable"
import { HKT } from "fp-ts/lib/HKT"

export function makeDo<M extends URIS2>(
  M: Monad<M>,
): <L, R>(other: Type2<M, L, void> | ((a: R) => Type2<M, L, void>)) => Type2<M, L, R>

export function makeDo<M extends URIS>(M: Monad<M>): <A>(other: Type<M, void> | ((a: A) => Type<M, void>)) => Type<M, A>

export function makeDo<M extends URIS>(M: Monad<M>) {
  return function<A>(other: Type<M, void> | ((a: A) => Type<M, void>)) {
    const self = this as HKT<M, A>
    return M.chain(self, (previous: A) =>
      M.map((typeof other === "function" ? other(previous) : other) as HKT<any, void>, () => previous),
    )
  }
}

export function makeLet<M extends URIS2>(M: Monad<M>): <N extends string, L, R>(name: N) => Type2<M, L, { [K in N]: R }>

export function makeLet<M extends URIS>(M: Monad<M>): <N extends string, A>(name: N) => Type<M, { [K in N]: A }>

export function makeLet<M extends URIS2>(
  M: Monad<M>,
): <N extends string, L, RA, RB>(
  name: N,
  other: Type2<M, L, RB> | ((a: RA) => Type2<M, L, RB>),
) => Type2<M, L, RA & { [K in N]: RB }>

export function makeLet<M extends URIS>(
  M: Monad<M>,
): <N extends string, A, B>(name: N, other: Type<M, B> | ((a: A) => Type<M, B>)) => Type<M, A & { [K in N]: B }>

export function makeLet<M extends URIS>(M: Monad<M>) {
  return function<N extends string, A, B>(name: N, other: Type<M, B> | ((a: A) => Type<M, B>)) {
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

export function makeFor<T extends URIS, M extends URIS2>(
  M: Monad<M>,
  T: Traversable<T>,
): <N extends string, L, RA, RB>(
  name: N,
  others: Type<T, Type2<M, L, RB>> | ((a: RA) => Type<T, Type2<M, L, RB>>),
) => Type2<M, L, RA & { [K in N]: Type<T, RB> }>

export function makeFor<T extends URIS, M extends URIS>(
  M: Monad<M>,
  T: Traversable<T>,
): <N extends string, A, B>(
  name: N,
  other: Type<T, Type<M, B>> | ((a: A) => Type<T, Type<M, B>>),
) => Type<M, A & { [K in N]: Type<T, B> }>

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
