/**
 * @fileoverview Auto fix the imports beginning in files
 * @author fengk
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import requireIndex from 'requireindex'

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------


// import all rules in lib/rules
export default {
    rules: requireIndex(__dirname + "/rules")
}
