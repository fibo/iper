
//
// IperEdge
// ========
//

var _    = require('underscore')
  , util = require('util')

var IperElement = require('./IperElement')

// Constructor

function IperEdge(graph, nodeIds) {

  if (_.isUndefined(graph))
    throw new Error()

  if (! (_.isObject(graph.nodes)))
    throw new Error()

  for (var i in nodeIds) {
    var id = nodeIds[i]
    if (_.isUndefined(graph.nodes[id]))
      throw new Error()
  }

  IperElement.call(this, graph)

  // nodeIds
  function getNodeIds() { return nodeIds }

  Object.defineProperty(this, 'nodeIds', {get: getNodeIds})
}

util.inherits(IperEdge, IperElement)

// remove
function remove () {
  this.graph.removeEdge(this.id)
}
IperEdge.prototype.remove = remove

module.exports = IperEdge

