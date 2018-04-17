module.exports = {
    valid:
`
import React from 'react'

import Rule from './Rule'

const Access = () => <div></div>
`,
    invalid: [
`
import axios from 'axios'
import React from 'react'

export default class Echarts extends React.Component {
    render() {
        return (
            <div></div>
        )
    }
}
`,
`
import React from 'react'
import axios from 'axios'

export default class Echarts extends React.Component {
    render() {
        return (
            <div></div>
        )
    }
}
`,
    3]
}