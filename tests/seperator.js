const rule = require ('../lib/rules/order')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 8,
        sourceType: 'module'
    },
    parser: 'babel-eslint'
})

const options = [
    [
        ['react', 'redux', 'axios'],
        ['/^\./ | 2'],
        ['/\.css$/ | 9']
    ], 8, 4
]

ruleTester.run('seperator', rule, {
    valid: [{
        code: `
import react from 'react'
import {createStore} from 'redux'
import axios from 'axios'
import A from './A'
import B from './B'
import C from './C'
import 'index.css'

export default React
        `,
        options
    }, {
        code: `
import react from 'react'
import {createStore} from 'redux'
import axios from 'axios'

import A from './A'
import B from './B'
import C from './C'

import 'index.css'
import 'bootstrap.min.css'

export default React
        `,
        options
    }],
    invalid: [{
        code: `
import react from 'react'
import {createStore} from 'redux'
import axios from 'axios'

import A from './A'
import B from './B'
import C from './C'

import 'index.css'

export default React
        `.trim(),
        options,
        errors: 2,
        output: `
import react from 'react'
import {createStore} from 'redux'
import axios from 'axios'
import A from './A'
import B from './B'
import C from './C'
import 'index.css'

export default React
        `.trim()
    }, {
        code: `
import react from 'react'
import A from './A'
import 'index.css'
import 'a.css'
import 'b.css'
import 'c.css'

export default React
        `.trim(),
        options,
        errors: 1,
        output: `
import react from 'react'
import A from './A'

import 'index.css'
import 'a.css'
import 'b.css'
import 'c.css'

export default React
        `.trim()
    }, {
        code: `
import react from 'react'
import {createStore} from 'redux'
import axios from 'axios'
import A from './A'
import B from './B'
import C from './C'
import 'index.css'
import 'a.css'

export default React
        `.trim(),
        options,
        errors: 2,
        output: `
import react from 'react'
import {createStore} from 'redux'
import axios from 'axios'

import A from './A'
import B from './B'
import C from './C'

import 'index.css'
import 'a.css'

export default React
        `.trim()
    }]
})