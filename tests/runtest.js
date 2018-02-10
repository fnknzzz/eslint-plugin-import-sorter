const rule = require('../lib/rules/test')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester()

ruleTester.run('test', rule, {
    valid: [{
        code: `
                import a from 'fs'
                import {b, c} from 'g'
              `,
        parserOptions: {
            ecmaVersion: 8,
            sourceType: 'module'
        }
    }],
    invalid: [{
        code: `
            import a from 'b'
            import v from 'a'
        `,
        parserOptions: {
            ecmaVersion: 8,
            sourceType: 'module'
        },
        errors: [{
            message: 'wrong order',
            type: 'ImportDeclaration'
        }]
    }]
})