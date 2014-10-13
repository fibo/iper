
var getIncidentEdgeIds = require('./getIncidentEdgeIds')
  , getOrphanEdgeIds = require('./getOrphanEdgeIds')
  , uniqueId = require('./uniqueId')

/**
 * Hypergraph
 * @class
 *
 * http://en.wikipedia.org/wiki/Hypergraph
 *
 * @param {Object} graph
 */

function Graph () {
  var arg = arguments[0] || {}

  this.edges = arg.edges || {}
  this.nodes = arg.nodes || {}
}

/**
 *
 * @param {Array} nodeIds
 * @returns {String} id
 */

function addEdge (nodeIds) {
  var id = uniqueId()

  this.edges[id] = nodeIds

  return id
}

Graph.prototype.addEdge = addEdge

/**
 *
 * @param {Any} data
 * @returns {String} id
 */

function addNode (data) {
  var id = uniqueId()

  this.nodes[id] = data

  return id
}

Graph.prototype.addNode = addNode

/**
 *
 * @param {String} id
 * @returns
 */

function delEdge (id) {
  var nodeIds = this.edges[id]

  delete this.edges[id]

  return nodeIds
}

Graph.prototype.delEdge = delEdge

/**
 *
 * @param {String} id
 * @returns {Any} data
 */

function delNode (id) {
  var edges = this.edges

  var data = this.nodes[id]
  delete this.nodes[id]

  var incidentEdgeIds = getIncidentEdgeIds.bind(this)(id)
  incidentEdgeIds.forEach(delEdge.bind(this))

  return data
}

Graph.prototype.delNode = delNode

module.exports = Graph

