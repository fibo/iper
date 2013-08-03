
//
// IperNode
// ========

var _    = require('underscore')
  , util = require('util')

var IperElement = require('./IperElement')

// Constructor

function IperNode(graph, data) {

  IperElement.call(this, graph)

  this.__defineGetter__('data', function () { return data })
}

util.inherits(IperNode, IperElement)

module.exports = IperNode

