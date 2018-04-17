module.exports = {
    valid: 
`
import a from 'a'
`,
    invalid: [
`
import {render} from 'react-dom'
const Fragment = React
import React from 'react'
import axios from 'axios'
`,
`
import React from 'react'
import {render} from 'react-dom'
import axios from 'axios'

const Fragment = React
`,
4
    ]
}