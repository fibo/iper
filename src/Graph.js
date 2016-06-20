var getIncidentEdgeIds = require('./getIncidentEdgeIds')
var uniqueId = require('lodash.uniqueid')
var getDegree = require('./getDegree')

/**
 * Hypergraph
 *
 * http://en.wikipedia.org/wiki/Hypergraph
 *
 * @class
 * @param {Object} [graph]
 */

// TODO add options (arg, opt) like
// * pseudograph: false, cannot create loops
// * multigraph: false, cannot duplicate edges
// * rank, maxDegree, etc
class Graph {
  constructor () {
    var arg = arguments[0] || {}

    this.edges = arg.edges || {}
    this.nodes = arg.nodes || {}
  }

  /**
   * @param {Array} nodeIds
   * @returns {String} id
   */

  addEdge (nodeIds) {
    var id = uniqueId()

    this.edges[id] = nodeIds

    return id
  }

  /**
   * @param {Any} data
   * @returns {String} id
   */

  addNode (data) {
    var id = uniqueId()

    this.nodes[id] = data

    return id
  }

  /**
   * @param {String} nodeId
   * @returns {Number} degree
   */

  degreeOf (nodeId) {
    return getDegree(this.edges, nodeId)
  }

  /**
   * @param {String} id
   * @returns {void}
   */

  delEdge (id) {
    delete this.edges[id]
  }

  /**
   * @param {String} id
   * @returns {void}
   */

  delNode (id) {
    delete this.nodes[id]

    let incidentEdgeIds = getIncidentEdgeIds(this.edges, id)

    for (let edgeId in incidentEdgeIds) {
      this.delEdge(edgeId)
    }
  }
}

module.exports = Graph
