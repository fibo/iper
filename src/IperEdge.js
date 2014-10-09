
var _        = require('underscore')
var uniqueId = require('./uniqueId')

/* Connects nodes
 *
 * @param {IperGraph} graph
 * @param {Array} nodeIds
 */

function IperEdge(graph, nodeIds) {

  this.graph = graph
  this.id = uniqueId()

  nodeIds.forEach(function (id) {
    var node = graph.getNode(id)

    // if maxDegree is not defined there is no trouble ...
    if (typeof node.maxDegree === 'undefined')
      return

    // otherwise check that node degree is not going to exceed its maxDegree 
    if (node.degree === node.maxDegree)
      throw new Error()
  })

  this.nodeIds = nodeIds

  // add this edge to graph
  graph.edges.push(this)
}

/**
 * Removes the edge from its graph
 *
 */

function remove () {
  this.graph.removeEdge(this.id)
}

IperEdge.prototype.remove = remove

module.exports = IperEdge

