module.exports = {
    valid:
`
"use directive"
import React from 'react'

import './index.css'

export { React }
`,
    invalid: [
`
"use directive"
import React from 'react'
import './index.css'
export { React }
`,
`
"use directive"
import React from 'react'

import './index.css'

export { React }
`,
    2]
}