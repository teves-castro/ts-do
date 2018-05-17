import { array } from "fp-ts/lib/Array"
import { state, State } from "fp-ts/lib/State"
import { makeDo, makeFor, makeLet } from "./builders"

declare module "fp-ts/lib/State" {
  interface State<S, A> {
    do(other: State<S, any> | ((a: A) => State<S, any>)): State<S, A>
    into<N extends string>(name: N): State<S, { [K in N]: A }>
    let<N extends string, B>(name: N, other: State<S, B> | ((a: A) => State<S, B>)): State<S, A & { [K in N]: B }>
    for<N extends string, B>(
      name: N,
      others: ReadonlyArray<State<S, B>> | ((a: A) => ReadonlyArray<State<S, B>>),
    ): State<S, A & { [K in N]: ReadonlyArray<B> }>
    return<B>(f: (a: A) => B): State<S, B>
  }
}
State.prototype.do = makeDo(state)
State.prototype.into = makeLet(state)
State.prototype.let = makeLet(state)
State.prototype.for = makeFor(state, array)
State.prototype.return = State.prototype.map

export const stateModule = "state"
