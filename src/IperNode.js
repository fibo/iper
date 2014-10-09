
var uniqueId = require('./uniqueId')
var _ = require('underscore')

/**
 * A node graph
 *
 * @params {IperGraph} graph
 * @params {Object} opts
 */

function IperNode(graph, opts) {
  var self = this

  this.graph = graph
  this.id = uniqueId()

  if (typeof opts !== 'object')
    opts = {}

  function getDegree () {
    var degree = 0

    // Count occurrences of node id in edge.nodeIds
    // for every edge in the graph.
    graph.edges.forEach(function (edge) {
      edge.nodeIds.forEach(function (nodeId) {
        if (nodeId === self.id)
          degree++
      })
    })

    return degree
  }

  Object.defineProperty(this, 'degree', {get: getDegree})

  function getMaxDegree () {
    return opts.maxDegree
  }

  Object.defineProperty(this, 'maxDegree', {get: getMaxDegree})

  // add this node to graph
  graph.nodes.push(this)
}

/**
 * Compute adjacent nodes
 *
 * @return {Array} adjacent node ids
 */

function getAdjacentNodeIds() {
  var id = this.id

  var adjacentNodeIds = []

  // loop over all edges
  _.each(this.graph.edges, function (edge) {
    // if edge contains node
    if (_.contains(edge.nodeIds, id))
      /* take all nodeIds except node self id */
      adjacentNodeIds.push(_.without(edge.nodeIds, id))
  })

  // since _.without() return an array and nodeIds can be repeated,
  // use _.uniq() and _.flatten() to return a flat array with no repetition
  return _.uniq(_.flatten(adjacentNodeIds))
}

IperNode.prototype.getAdjacentNodeIds = getAdjacentNodeIds

// TODO remove(), oppure toglilo ad IperEdge

module.exports = IperNode

