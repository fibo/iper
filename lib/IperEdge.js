
//
// IperEdge
//

var _    = require('underscore')
  , util = require('util')

var IperElement = require('./IperElement')

// Constructor

function IperEdge(data) {
  IperElement.call(this)
}

function check(data) {
  return true
}

util.inherits(IperEdge, IperElement)

module.exports = IperEdge

