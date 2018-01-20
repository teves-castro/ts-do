# Description

This library works as an extension for [fp-ts](https://github.com/gcanti/fp-ts) allowing the usage a 'sort of' do notation

# Installation

To install the stable version:

```
yarn install ts-do
```

# Using the extension

Start by importing the extension:

```
import "ts-do"
```

After just use the new methods on the existing types:

```
import { some } from "fp-ts/lib/Option"

const result = some({})
    .let("x", some(3))
    .for("ys", ({ x }) => range(0, x).map(() => some(1)))
    .return(({ x, ys }) => x - sum(ys))
```

Check the test folder for a few more examples.
