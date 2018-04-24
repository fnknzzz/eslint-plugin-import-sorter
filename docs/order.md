# import-sorter/order

Imports would be bringed up into top of the file in a fixed order.

According to ES6 stantard, import statements would be hoisted to top, no matter where they are and their relation order.

In project we usually compiled imports into CommonJS`require`, which is sensible in relation order. This may cause unpredictable problem, ensure test after sorting imports. Fortunately, almost all time it won't cause problems. Once it happend, fix the problem is very simple.

## Rule Details

### Options

The first needed option is the `order`. It is a two-demesion arrays like this:

```json
    [
        ["matcher1 | priority", "matcher2"],
        ["/RegMatcher1/ | priority"]
    ]
```


The main option `order` recieves an two-demensional array which consists with `group-option`. Different groups will be seperated with an empty line. If you don't want lines-between in defferent group, just set options in a single group.

A `group-option` consists with `matcher` and `priority`, joined in '|' and several white-space as you like.



#### Matcher

A `matcher` is a string. If the string starts and ends with '/', then we considered it as a RegExp literal matcher created by JS `RegExp` constructor with chars between the two '/'. Otherwise as an absolute matcher, *only* when the package name absolute equals to the matcher.

**Note.** Maybe many `\` will be used in RegExp matcher. Remember `\\` will be transferred to a `\`. 

For exmaple, if you want a RegExp matcher with literal like this

```js
/^\.\.\//
```

 you need to set the option json like this:
 
```json
"/^\\.\\.\\//"
```

#### Priority

Sometimes an import declaration could be matched with several matcher, then `priority` should be considered. Import declarations are always matches the bigger priority option.

**Note** `priority` can be omitted, if so, it would be considered `10` as default.

If the first statement is a directive, it will still be ignored.

#### Limit

Sometimes you may don't want imports like this:
```js
    import a from 'a'

    import b from './b'

    import c from '../../c'

    export {a, b, c}
```

If there are few imports but seperated with empty lines, it may be considered to be better without empty lines. So a number can be set, when imports' length is smaller than the number, there won't be seperators except the last one.

#### GroupLength

What about a group matching many imports? If a group length reaches the number you set, there are always seperators before and after the group.
*ignore* the limit you set.

## Example

Option:
```json
{
    "rules": {
        "import-sorter/order": [
            2,
            [
                ["react", "react-dom", "react-router"],
                ["/^\\\\.\\// | 1"],
                ["/\\.css$/ | 9"]
            ],
            8,
            3
        ]
    }
}
```

Origin import declarations:
```js
import {HashRouter} from 'react-router'
import {render} from 'react-dom'
import React from 'react'
import './index.css'

import A from './A'
const a = 1
import B from './B'
```

Then the fixed result:
```js
import React from 'react'
import {render} from 'react-dom'
import {HashRouter} from 'react-router'

import A from './A'
import B from './B'
import './index.css'

const a = 1
```