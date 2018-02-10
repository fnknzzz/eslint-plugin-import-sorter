# eslint-plugin-import-sorter

Auto fix the imports beginning in files

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
        "import-sorter/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here





