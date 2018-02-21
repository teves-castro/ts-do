import { array } from "fp-ts/lib/Array"
import { parser, Parser } from "parser-ts"
import { makeDo, makeFor, makeLet } from "./builders"

declare module "parser-ts" {
  interface Parser<A> {
    do(other: Parser<any> | ((a: A) => Parser<any>)): Parser<A>
    consume(other: Parser<any> | ((a: A) => Parser<any>)): Parser<A>
    into<N extends string>(name: N): Parser<{ [K in N]: A }>
    let<N extends string, B>(name: N, other: Parser<B> | ((a: A) => Parser<B>)): Parser<A & { [K in N]: B }>
    parse<N extends string, B>(name: N, other: Parser<B> | ((a: A) => Parser<B>)): Parser<A & { [K in N]: B }>
    for<N extends string, B>(
      name: N,
      others: ReadonlyArray<Parser<B>> | ((a: A) => ReadonlyArray<Parser<B>>),
    ): Parser<A & { [K in N]: ReadonlyArray<B> }>
    return<B>(f: (a: A) => B): Parser<B>
  }
}
Parser.prototype.do = makeDo(parser)
Parser.prototype.consume = Parser.prototype.do
Parser.prototype.into = makeLet(parser)
Parser.prototype.let = makeLet(parser)
Parser.prototype.parse = Parser.prototype.let
Parser.prototype.for = makeFor(parser, array)
Parser.prototype.return = Parser.prototype.map

export const parserModule = "parser"
