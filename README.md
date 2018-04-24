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
````

## Rules 

* Sort imports into a fixed order. ([order](https://github.com/fengkfengk/eslint-plugin-import-sorter/tree/master/docs/order.md]))
* Sort specifiers within a single import. ([specifier](https://github.com/fengkfengk/eslint-plugin-import-sorter/tree/master/docs/specifier.md))
