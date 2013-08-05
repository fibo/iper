
//
// IperNode
// ========
//

var _    = require('underscore')
  , util = require('util')

var IperElement = require('./IperElement')

// Constructor

function IperNode(graph, data) {

  IperElement.call(this, graph)

  // data
  function getData() { return data }

  Object.defineProperty(this, 'data', {get: getData})
}

util.inherits(IperNode, IperElement)

// remove
function remove () {
  this.graph.removeNode(this.id)
}
IperNode.prototype.remove = remove

module.exports = IperNode

