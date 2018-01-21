# Description

This library works as an extension for [fp-ts](https://github.com/gcanti/fp-ts) allowing the usage of a haskell like do notation. One can use .let and .for to chain computations on any of the supplied monads.
Each .let or .for in the computation chain contributes to a threaded context that is available to each subsequent step.

# Installation

To install the stable version:

```
yarn install ts-do
```

# Using the extension

Start by importing the extension:

```
import { some } from "fp-ts/lib/Option"
import { range, sum } from "ramda"
import "ts-do"

const result = some({})
    .let("x", some(3))
    .for("ys", ({ x }) => range(0, x).map(() => some(1)))
    .return(({ x, ys }) => x - sum(ys))

// result === some(0)
```

Check the test folder for a few more examples.

# Building

Clone the repo

```
git clone git@github.com:teves-castro/ts-do.git
```

Install dependencies

```
yarn
```

Test

```
yarn run test
```

Compile

```
yarn run build
```

# Disclaimer

This kind of operations (do notation) should be done with compiler support, like the special case of async/await for promises, that is included in most major languages these days.

Although these languages are adopting more and more functional programming constructs, saddly more advanced concepts are left out due to not having critical mass to demand it's implementation.

So, this is an experiment on what can be accomplished without that compiler support. Meaning that if/when this is supported nativelly by the language itself, certainly with different syntax, this will become obsolete.

Also I make no commitment to evolve the library beyond my own needs, so bear these warnings in mind when using the library.
And of course I appreciate any comments and sujestions on how to improve or on how I completely blundered something.