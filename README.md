# eslint-plugin-import-sorter

Auto fix the imports beginning in files.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-import-sorter`:

```
$ npm install eslint-plugin-import-sorter --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-import-sorter` globally.

## Usage

Add `import-sorter` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "import-sorter"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "import-sorter/order": [
            2, 
            [
                ["group1", "NameMatcher", "/RegExpMatcher/ | priority"],
                ["group2"]
            ]
        ]
    }
}
```

The main option `order` recieves an two-demensional array which consists with `group-option`. Different groups will be seperated with an empty line. If you don't want this, just set options in one group.

A `group-option` consists with `matcher` and priority, joined in '|' and several white-space.

A `matcher` is a string. If the string starts and ends with '/', then we considered it as a RegExp literal matcher created by JS RegExp constructor with chars between the two '/'. Otherwise as an absolute matcher, only when the package name absolute equals to the matcher.

**Note.** Maybe many `\` will be used in RegExp matcher. Remember *TWO* `\` will be transferred to a *single* `\`. 

For exmaple, if you want a RegExp matcher with literal like this

```js
/^\.\.\//
```

 you need to set the option json like this:
 
```json
"/^\\.\\.\\//"
```

Sometimes an import declaration could be matched with several matcher, then `priority` should be considered. Import declarations are always matches the bigger priority option.

**Note.** `Priority` could be float more than just interger.

## Example

Option:
```json
{
    "rules": {
        "import-sorter/order": [
            2,
            [
                ["react", "react-dom", "react-router", "axios"],
                ["/^\\.\\.\\// | 1", "/^\\\\.\\\\// | 1"],
                ["moment"],
                ["/\\.css$/ | 9"]
            ]
        ]
    }
}
```

Origin import declarations:
```js
import React, {Component} from 'react'
import {render} from 'react-dom'
import './index.css'

import Main from '../main/Main.js'

var a = '1'
```

Then the fixed result:
```js
import React, {Component} from 'react'
import {render} from 'react-dom'

import Main from '../main/Main.js'

import './index.css'

var a = '1'
```

## Next Plan

Sort the `Specifiers` order.

## Supported Rules

* order
