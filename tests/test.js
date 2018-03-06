const rule = require('../lib/rules/order')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester()
const parserOptions = {
    ecmaVersion: 8,
    sourceType: 'module'
}
const options = [{
    order: ['a', 'b', 'c'],
    groups: {
        a: {
            member: 'byUsingOrder',
            sorter: 'byType',
            match: 'd',
            separator: true,
        }
    },
    defaultSetting: {
        member: 'byUsingOrder',
        group: 'byName',
        separator: false
    }
}]

ruleTester.run('test', rule, {
    valid: [{
        code: 
`import a from 
 'd'
import {b, c} from 'c'`,
        parserOptions,
        options
    }],
    invalid: [{
        code: 
`import a from 'c'
import v from 'd'

var aa = 123`.trim(),
        errors: [{
            message: 'group `c` should be placed after group `a`',
            type: 'ImportDeclaration'
        }],
        output: 
`import v from 'd'

import a from 'c'

var aa = 123`,
        parserOptions,
        options
    }]
})