
//
// IperEdge
//

var _    = require('underscore')
  , util = require('util')

var IperNode = require('./IperNode')

// Constructor

function IperEdge(data) {
  IperNode.call(this, data, check)
}

function check(data) {
  return true
}

util.inherits(IperEdge, IperNode)

module.exports = IperEdge

