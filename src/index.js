/**
 * @fileoverview Auto fix the imports beginning in files
 * @author fengk
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// var requireIndex = require("requireindex");
import requireIndex from 'requireindex'

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------


// import all rules in lib/rules
export const rules = requireIndex(__dirname + "/rules");



