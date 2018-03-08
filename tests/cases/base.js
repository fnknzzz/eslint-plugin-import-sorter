module.exports = {
    valid:
`
import React from 'react'
import { render } from 'react-dom'

import Main from '../main/Main.js'

import '../index.css'

var a = '1'
`,
    invalid: [
`
import React, {Component} from 'react'
import {render} from 'react-dom'
import './index.css'

import Main from '../main/Main.js'

var a = '1'
`, 
`
import React, {Component} from 'react'
import {render} from 'react-dom'

import Main from '../main/Main.js'

import './index.css'

var a = '1'
`, 
[
    'Wrong seperator, should be after 1 instead of 0 empty lines',
    'Wrong placement, should be at line 4 instead of line 3',
    'Wrong placement, should be at line 3 instead of line 4'
]]
}