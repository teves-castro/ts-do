import { Kind, Kind2, Kind3, Kind4, URIS, URIS2, URIS3, URIS4 } from "fp-ts/lib/HKT"
import { Monad1, Monad2, Monad3, Monad4 } from "fp-ts/lib/Monad"
import { Traversable1 } from "fp-ts/lib/Traversable"

type K1<M extends URIS, A, B> = (a: A) => Kind<M, B>
type K2<M extends URIS2, L, A, B> = (a: A) => Kind2<M, L, B>
type K3<M extends URIS3, E, L, A, B> = (a: A) => Kind3<M, E, L, B>
type K4<M extends URIS4, S, E, L, A, B> = (a: A) => Kind4<M, S, E, L, B>

// Bind
export function bind<M extends URIS4>(
  M: Monad4<M>,
): <S, E, L, A, B, N extends string>(
  n: N,
  fb: K4<M, S, E, L, A, B>,
) => (fa: Kind4<M, S, E, L, A>) => Kind4<M, S, E, L, A & { [K in N]: B }>

export function bind<M extends URIS3>(
  M: Monad3<M>,
): <E, L, A, B, N extends string>(
  n: N,
  fb: K3<M, E, L, A, B>,
) => (fa: Kind3<M, E, L, A>) => Kind3<M, E, L, A & { [K in N]: B }>

export function bind<M extends URIS2>(
  M: Monad2<M>,
): <L, A, B, N extends string>(
  n: N,
  fb: K2<M, L, A, B>,
) => (fa: Kind2<M, L, A>) => Kind2<M, L, A & { [K in N]: B }>

export function bind<M extends URIS>(
  M: Monad1<M>,
): <A, B, N extends string>(
  n: N,
  fb: K1<M, A, B>,
) => (fa: Kind<M, A>) => Kind<M, A & { [K in N]: B }>

export function bind<M extends URIS>(M: Monad1<M>) {
  return <A, B, N extends string>(n: N, fb: (a: A) => Kind<M, B>) => (fa: Kind<M, A>) =>
    M.chain(fa, a => M.map(fb(a), value => Object.assign({}, a, { [n]: value })))
}

// Into
export function into<M extends URIS4>(
  M: Monad4<M>,
): <N extends string>(
  n: N,
) => <S, E, L, A>(fa: Kind4<M, S, E, L, A>) => Kind4<M, S, E, L, { [K in N]: A }>

export function into<M extends URIS3>(
  M: Monad3<M>,
): <N extends string>(
  n: N,
) => <E, L, A>(fa: Kind3<M, E, L, A>) => Kind3<M, E, L, { [K in N]: A }>

export function into<M extends URIS2>(
  M: Monad2<M>,
): <N extends string>(n: N) => <L, A>(fa: Kind2<M, L, A>) => Kind2<M, L, { [K in N]: A }>

export function into<M extends URIS>(
  M: Monad1<M>,
): <N extends string>(n: N) => <A>(fa: Kind<M, A>) => Kind<M, { [K in N]: A }>

export function into<M extends URIS>(M: Monad1<M>) {
  return <N extends string>(n: N) => <A>(fa: Kind<M, A>) =>
    M.map(fa, value => ({ [n]: value }))
}

// Exec
export function exec<M extends URIS4>(
  M: Monad4<M>,
): <S, E, L, A>(
  fb: K4<M, S, E, L, A, unknown>,
) => (fa: Kind4<M, S, E, L, A>) => Kind4<M, S, E, L, A>

export function exec<M extends URIS3>(
  M: Monad3<M>,
): <E, L, A>(fb: K3<M, E, L, A, unknown>) => (fa: Kind3<M, E, L, A>) => Kind3<M, E, L, A>

export function exec<M extends URIS2>(
  M: Monad2<M>,
): <L, A>(fb: K2<M, L, A, unknown>) => (fa: Kind2<M, L, A>) => Kind2<M, L, A>

export function exec<M extends URIS>(
  M: Monad1<M>,
): <A>(fb: K1<M, A, unknown>) => (fa: Kind<M, A>) => Kind<M, A>

export function exec<M extends URIS>(M: Monad1<M>) {
  return <A>(fb: K1<M, A, unknown>) => (fa: Kind<M, A>) =>
    M.chain(fa, a => M.map(fb(a), () => a))
}

// Sequence
export function sequence<T extends URIS, M extends URIS4>(
  T: Traversable1<T>,
  M: Monad4<M>,
): <S, E, L, A, B, N extends string>(
  n: N,
  fb: K1<T, A, Kind4<M, S, E, L, B>>,
) => (fa: Kind4<M, S, E, L, A>) => Kind4<M, S, E, L, A & { [K in N]: Kind<T, B> }>

export function sequence<T extends URIS, M extends URIS3>(
  T: Traversable1<T>,
  M: Monad3<M>,
): <E, L, A, B, N extends string>(
  n: N,
  fb: K1<T, A, Kind3<M, E, L, B>>,
) => (fa: Kind3<M, E, L, A>) => Kind3<M, E, L, A & { [K in N]: Kind<T, B> }>

export function sequence<T extends URIS, M extends URIS2>(
  T: Traversable1<T>,
  M: Monad2<M>,
): <L, A, B, N extends string>(
  n: N,
  fb: K1<T, A, Kind2<M, L, B>>,
) => (fa: Kind2<M, L, A>) => Kind2<M, L, A & { [K in N]: Kind<T, B> }>

export function sequence<T extends URIS, M extends URIS>(
  T: Traversable1<T>,
  M: Monad1<M>,
): <A, B, N extends string>(
  n: N,
  fb: K1<T, A, Kind<M, B>>,
) => (fa: Kind<M, A>) => Kind<M, A & { [K in N]: Kind<T, B> }>

export function sequence<T extends URIS, M extends URIS>(
  T: Traversable1<T>,
  M: Monad1<M>,
) {
  return <A, B, N extends string>(n: N, fb: K1<T, A, Kind<M, B>>) => (fa: Kind<M, A>) =>
    M.chain(fa, a => M.map(T.sequence(M)(fb(a)), v => Object.assign({}, a, { [n]: v })))
}
