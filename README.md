# Description

This library works as an extension for [fp-ts](https://github.com/gcanti/fp-ts) allowing the usage of a haskell like do notation. One can use .do, .let, .for and .into to chain computations on any of the supplied monads.
Each .let or .for in the computation chain contributes to a threaded context that is available to each subsequent step. A .do method can also be used to perform computations that add nothing to the context.
It is also possible (and relatively easy) to use the builders to add support for other monads.

# Installation

To install the stable version:

```bash
yarn install ts-do
```

# Using the extension

Start by importing the extension:

```typescript
import { some } from "fp-ts/lib/Option"
import { range, sum } from "ramda"
import "ts-do"

const result = some(3)
    .into("x")                                              // Chains the computation. Creates a context with { x: 3 }
    .do(some(undefined))                                    // Chains the computation. Adds nothing to the context
    .for("ys", ({ x }) => range(0, x).map(() => some(1)))   // Sequences computations. Adds { ys: [1, 1, 1] } to the context
    .return(({ x, ys }) => x - sum(ys))

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
