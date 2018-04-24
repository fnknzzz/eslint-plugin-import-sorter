# import-sorter/specifier

## Rule Details

Enforce the specifiers within an import statement in a fixed order.

## Options

You may set two options about this rule:

* specifier order: ''byUsingOrder' or 'byName'(default)
* first-group: 'default' or 'namespace'(default)

## Examples

###option: ['byUsingOrder']:

pass:
```js
import {b, a, c} from 'x'

const x = b
const y = a
const z = c
```

fail:
```js
// `b` is referenced before `a`
import {b, a, c} from 'x'

const y = a
const x = b
const z = c

```

###option: ['byName']:

pass:
```js
import {a, b, c} from 'x'

const x = b
const y = a
const z = c
```
fail:
```js
// `b` is bigger than `a` by dictionary order
import {b, a, c} from 'x'

const x = b
const y = a
const z = c
```

### option: ['default']:

pass:
```js
import {a, d, b as c} from 'x'
```

fail:
```js
// default-name specifier should be placed ahead of namespace specifier
import {b as c, a, d} from 'x'
```

### option: ['namespace']:
pass:
```js
import {b as c, a, d} from 'x'
```

fail:
```js
// namespace specifiershould be placed ahead of default-name specifier
import {a, d, b as c} from 'x'
```

## Usage

You can use the rules without fixed order, like `['namespace']` or `[byName]` or `['namespace', 'byUsingOrder']` are all valid. All specifiers can be devided into two groups, the groups order is determined by `namespace` or `default`, the specifiers order within a group is determined by `byName` or `byUsingOrder`.