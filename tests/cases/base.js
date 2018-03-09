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
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import styled from 'styled-components'
import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import Main from './module/main/component/Main'
import {message, LocaleProvider} from 'antd'

import { StorageKey } from '__res/R'
import axios from 'axios'
 
import main from './module/main/reducer/main.js'

import './res/css/app.css'

const a = 1
`, 
`
import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import styled from 'styled-components'
import {message, LocaleProvider} from 'antd'
import axios from 'axios'

import { StorageKey } from '__res/R'

import Main from './module/main/component/Main'
import main from './module/main/reducer/main.js'

import './res/css/app.css'

const a = 1
`, 
[
    'Wrong placement, should be at line 4 instead of line 3',
    'Wrong placement, should be at line 6 instead of line 4',
    'Wrong placement, should be at line 3 instead of line 5',
    'Wrong placement, should be at line 5 instead of line 6',
    'Wrong placement, should be at line 10 instead of line 7',
    'Wrong placement, should be at line 7 instead of line 8',
    'Wrong seperator, should be after 1 instead of 0 empty lines',
    'Wrong placement, should be at line 8 instead of line 10',
]]
}