const rule = require ('../lib/rules/specifier')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 8,
        sourceType: 'module'
    },
    parser: 'babel-eslint'
})

ruleTester.run('specifier', rule, {
    valid: [{
        code: `
            import {a, b, c} from 'x'
        `
    }, {
        code: `
            import {b, a} from 'x'
            const x = b
            const y = a
        `,
        options: ['byUsingOrder']
    }, {
        code: `
            import a, {b as c, d} from 'x'
        `
    }],
    invalid: [{
        code: `
            import {b, a, c} from 'x'
        `,
        errors: 1
    }]
})