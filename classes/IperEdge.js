
//
// IperEdge
// ========
//

var _        = require('underscore')
  , inherits = require('inherits')

var IperElement = require('./IperElement')

// Constructor

function IperEdge(graph, nodeIds) {
  var self = this

  // check graph
  if (_.isUndefined(graph))
    throw new Error()

  if (! (_.isObject(graph.nodes)))
    throw new Error()

  // check nodeIds
  if (! (_.isArray(nodeIds)))
    throw new Error()

  _.each(nodeIds, function (id) {
    var node = graph.getNode(id)

    // check that nodeIds refers to existing nodes
    if (_.isUndefined(node))
      throw new Error()

    // if maxDegree is not defined there is no trouble ...
    if (_.isUndefined(node.maxDegree))
      return

    // otherwise check that node degree is not going to exceed its maxDegree
    if (node.degree === node.maxDegree)
      throw new Error()
  })

  IperElement.call(this, graph)

  // nodeIds
  function getNodeIds() { return nodeIds }

  Object.defineProperty(this, 'nodeIds', {get: getNodeIds})

  // register in graph
  graph.pushEdge(self)
}

inherits(IperEdge, IperElement)

// remove
function remove () {
  this.graph.removeEdge(this.id)
}
IperEdge.prototype.remove = remove

module.exports = IperEdge

