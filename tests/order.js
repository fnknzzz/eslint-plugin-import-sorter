const requireIndex = require('requireindex')
const rule = require('../lib/rules/order')
const RuleTester = require('eslint').RuleTester

const parserOptions = {
    ecmaVersion: 8,
    sourceType: 'module'
}
const options = [
    [
        [
            "react",
            "react-dom",
            "redux",
            "react-redux",
            "redux-thunk",
            "react-router",
            "react-router-dom",
            "styled-components",
            "/^antd/",
            "axios",
            "moment"
        ],
        [
            "/^__/ | 8"
        ],
        [
            "/(\\.\\.\\/){2}/",
            "/(\\.\\.\\/){1}/",
            "/(\\.\\/)/",
            "/^(\\w+\\/)+/ | 7"
        ],
        [
            "/\\.css$/ | 9"
        ] 
    ]
]

const ruleTester = new RuleTester({
    parserOptions,
    parser: 'babel-eslint'
})

const cases = Object.values(requireIndex(__dirname + '/orderBases'))

ruleTester.run('test', rule, {
    valid: cases.map(_case => _case.valid)
            .map(code => ({
                code: code.trim(),
                options
            })),
    invalid: cases.map(_case => _case.invalid)
            .map(([code, output, messages]) => {
                return ({
                    code: code.trim(),
                    output: output.trim(),
                    errors: typeof messages === 'number'? messages : messages.map(message => ({
                        message,
                        type: 'ImportDeclaration'
                    })),
                    options
                })
            })
})