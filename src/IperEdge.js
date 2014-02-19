
//
// # IperEdge
//

var _        = require('underscore')
  , inherits = require('inherits')

var IperElement = require('./IperElement')

//
// ## Constructor
//

function IperEdge(graph, nodeIds) {

  //
  // ### signature (graph, nodeIds)
  //

  // *graph* must be defined
  if (_.isUndefined(graph))
    throw new Error()

  // *graph.nodes* must be an object
  if (! (_.isObject(graph.nodes)))
    throw new Error()

  // *nodeIds* must be an array
  if (! (_.isArray(nodeIds)))
    throw new Error()

  _.each(nodeIds, function (id) {
    var node = graph.getNode(id)

    /* check that nodeIds refers to existing nodes */
    if (_.isUndefined(node))
      throw new Error()

    /* if maxDegree is not defined there is no trouble ... */
    if (_.isUndefined(node.maxDegree))
      return

    /* otherwise check that node degree is not going to exceed its maxDegree */
    if (node.degree === node.maxDegree)
      throw new Error()
  })

  IperElement.call(this, graph)

  //
  // ## Attributes
  //

  //
  // ### nodeIds
  //
  // It is an array of node ids.
  //

  Object.defineProperty(this, 'nodeIds', {
    enumerable: true,
    value: nodeIds
  })

  /* add this edge to graph */
  graph.edges.push(this)
}

inherits(IperEdge, IperElement)

//
// ## Methods
//

//
// ### remove()
//
// Removes the edge from its graph
//

function remove () {
  this.graph.removeEdge(this.id)
}

IperEdge.prototype.remove = remove

module.exports = IperEdge

