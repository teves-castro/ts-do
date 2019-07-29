# Description

This library works as an extension for [fp-ts](https://github.com/gcanti/fp-ts) allowing the usage of a haskell like do notation. One can use exec, bind, sequence and into to chain computations on any of the supplied monads.
Each bind or sequence in the computation chain contributes to a threaded context that is available to each subsequent step. The exec function can also be used to perform computations that add nothing to the context for their side-effects.
It is possible to use this with any monads as long as its kind is defined in ft-ts.

# Installation

To install the stable version:

```bash
yarn add ts-do
```

# Using the extension

Start by importing the extension:

```typescript
import { some, map } from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { range, sum } from "ramda"
import * as Do from "ts-do"

const bind = Do.bind(option)
const into = Do.into(option)
const exec = Do.exec(option)
const sequence = Do.sequence(array, option)

const result = pipe(
  some(3),
  into("x"), // Chains the computation. Creates a context with { x: 3 }
  exec(() => some(undefined)), // Chains the computation. Adds nothing to the context
  sequence("ys", ({ x }) => range(0, x).map(() => some(1))), // Sequences computations. Adds { ys: [1, 1, 1] } to the context
  map(({ x, ys }) => x - sum(ys)),
)

// result === some(0)
```

Check the test folder for a few more examples.

# Building

Clone the repo

```bash
git clone git@github.com:teves-castro/ts-do.git
```

Install dependencies

```bash
yarn
```

Test

```bash
yarn run test
```

Compile

```bash
yarn run build
```

# Disclaimer

These kind of operations (do notation) should be done with compiler support, like the special case of async/await for promises, that is included in most major languages these days.

Although these languages are adopting more and more functional programming constructs, sadly more advanced concepts are left out due to not having critical mass to demand it's implementation.

So, this is an experiment on what can be accomplished without that compiler support. Meaning that if/when this is supported natively by the language itself, certainly with different syntax, this will become obsolete.

Also I make no commitment to evolve the library beyond my own needs, so bear these warnings in mind when using the library.
And of course I appreciate any comments and suggestions on how to improve or on how I completely blundered something.
