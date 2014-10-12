
var uniqueId = require('./uniqueId')

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
  delete this.edges[id]
}

Graph.prototype.delEdge = delEdge

/**
 *
 * @param {String} id
 * @returns {Any} data
 */

function delNode (id) {
  delete this.nodes[id]
}

Graph.prototype.delNode = delNode

module.exports = Graph

