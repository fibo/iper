var getIncidentEdgeIds = require('./getIncidentEdgeIds')
var uniqueId = require('lodash.uniqueid')

/**
 * Hypergraph
 *
 * http://en.wikipedia.org/wiki/Hypergraph
 *
 * @class
 * @param {Object} graph
 */

class Graph {
  constructor () {
    var arg = arguments[0] || {}

    this.edges = arg.edges || {}
    this.nodes = arg.nodes || {}
  }

  /**
   *
   * @param {Array} nodeIds
   * @returns {String} id
   */

  addEdge (nodeIds) {
    var id = uniqueId()

    this.edges[id] = nodeIds

    return id
  }

  /**
   *
   * @param {Any} data
   * @returns {String} id
   */

  addNode (data) {
    var id = uniqueId()

    this.nodes[id] = data

    return id
  }

  /**
   *
   * @param {String} id
   * @returns
   */

  delEdge (id) {
    var nodeIds = this.edges[id]

    delete this.edges[id]

    return nodeIds
  }

  /**
   *
   * @param {String} id
   * @returns {Any} data
   */

  delNode (id) {
    let data = this.nodes[id]
    delete this.nodes[id]

    let incidentEdgeIds = getIncidentEdgeIds(this.edges, id)

    for (let edgeId in incidentEdgeIds) {
      this.delEdge(edgeId)
    }

    return data
  }
}

module.exports = Graph
