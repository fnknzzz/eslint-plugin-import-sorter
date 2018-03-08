const requireIndex = require('requireindex')
const rule = require('../lib/rules/order')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester()
const parserOptions = {
    ecmaVersion: 8,
    sourceType: 'module'
}
const options = [
    [
        ['react', 'react-dom', 'react-router', 'axios'],
        ['/^\\.\\.\\// | 1', '/^\\.\\// | 1'],
        ['moment'],
        ['/\\.css$/ | 9']
    ]
]

const cases = Object.values(requireIndex(__dirname + '/cases'))

ruleTester.run('test', rule, {
    valid: cases.map(_case => _case.valid)
            .map(code => ({
                code: code.trim(),
                parserOptions,
                options
            })),
    invalid: cases.map(_case => _case.invalid)
            .map(([code, output, messages]) => ({
                code: code.trim(),
                output: output.trim(),
                errors: messages.map(message => ({
                    message,
                    type: 'ImportDeclaration'
                })),
                parserOptions,
                options
            }))
})