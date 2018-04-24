const rule = require ('../lib/rules/specifier')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 8,
        sourceType: 'module'
    },
    parser: 'babel-eslint'
})

ruleTester.run('specifier order', rule, {
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
        errors: 1,
        output: `
            import {a, b, c} from 'x'
        `
    }, {
        code: `
            import {a, b} from 'x'
            const x = b
            const y = a
        `,
        errors: 1,
        output: `
            import {b, a} from 'x'
            const x = b
            const y = a
        `,
        options: ['byUsingOrder']
    }, {
        code: `
            import a, {x as y, e, b as c, d} from 'x'
        `,
        errors: 1,
        output: `
            import a, {b as c, x as y, d, e} from 'x'
        `
    }, {
        code: `
            import a, {x as y, e, b as c, d} from 'x'
            const ee = e, dd = d
        `,
        errors: 1,
        output: `
            import a, {e, d, x as y, b as c} from 'x'
            const ee = e, dd = d
        `,
        options: ['byUsingOrder', 'default']
    }]
})