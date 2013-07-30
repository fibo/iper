
var util = require('util')

var IperNode = require('./IperNode.js')

function IperEdge(nodeIds) {
  IperNode.call(this, nodeIds)
  this.__defineGetter__('nodeIds', function () { return this.data })
}

util.inherits(IperEdge, IperNode)

module.exports = IperEdge

