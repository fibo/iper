const getIncidentEdgeIds = require('./getIncidentEdgeIds')
const uniqueId = require('lodash.uniqueid')
const uniqBy = require('lodash.uniqby')
const getDegree = require('./getDegree')
const defaultGraph = require('./defaultGraph')

/**
 * Hypergraph
 *
 * http://en.wikipedia.org/wiki/Hypergraph
 *
 * @class
 * @param {Object} [graph]
 */

// TODO add options (arg, opt) like
// * multigraph: false, cannot duplicate edges
// * rank, maxDegree, etc
class Graph {
  constructor () {
    var arg = arguments[0] || defaultGraph

    if (arg.pseudograph === true) this.pseudograph = true

    this.edges = arg.edges || defaultGraph.edges
    this.nodes = arg.nodes || defaultGraph.nodes
  }

  /**
   * Add an hyperedge that connects given nodeIds.
   *
   * @param {Array} nodeIds
   * @returns {String} id
   */

  addEdge (nodeIds) {
    if (this.pseudograph) {
      if (uniqBy(nodeIds).length < nodeIds.length) {
        throw new Error('In a pseudograph it is not allowed to create loops')
      }
    }

    // TODO throw error nodeIds not found
    const id = uniqueId()

    this.edges[id] = nodeIds

    return id
  }

  /**
   * Add a node, containing given data.
   *
   * @param {*} data
   * @returns {String} id of the node created
   */

  addNode (data) {
    const id = uniqueId()

    this.nodes[id] = data

    return id
  }

  /**
   * Returns the degree of a node, that is the number of incident edges with loops counted twice.
   *
   * @param {String} nodeId
   * @returns {Number} degree
   */

  degreeOf (nodeId) {
    return getDegree(this.edges, nodeId)
  }

  /**
   * Delete edge by given id.
   *
   * @param {String} id
   * @returns {void}
   */

  delEdge (id) {
    delete this.edges[id]
  }

  /**
   * Delete node by given id.
   *
   * @param {String} id
   * @returns {void}
   */

  delNode (id) {
    delete this.nodes[id]

    const incidentEdgeIds = getIncidentEdgeIds(this.edges, id)

    // TODO in an hypergraph it should not remove the edge, but
    // remove the nodeIds from edges. and remove the edge if it is empty.
    // Document in the README and the jsdoc above that it removes also edges
    for (var edgeId in incidentEdgeIds) {
      this.delEdge(edgeId)
    }
  }
}

module.exports = Graph
