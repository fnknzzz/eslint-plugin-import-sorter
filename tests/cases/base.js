module.exports = {
    valid:
`
import a from 'd'
import {b, c} from 'c'
`,
    invalid: [
`
import a from
'c'
import v from 'd'

var aa = 123
`, 
`
import v from 'd'

import a from
'c'

var aa = 123
`, 
['group `c` should be placed after group `a`']]
}