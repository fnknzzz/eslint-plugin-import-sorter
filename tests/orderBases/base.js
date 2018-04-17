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
    'Wrong placement.',
    'Wrong placement.',
    'Wrong placement.',
    'Wrong placement.',
    'Wrong placement.',
    'Wrong placement.',
    'Should be followed by 1 empty line.',
    'Wrong placement.',
]]
}