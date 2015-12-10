import getIncidentEdgeIds from './getIncidentEdgeIds'
import getOrphanEdgeIds from './getOrphanEdgeIds'
import uniqueId from './uniqueId'

/**
 * Hypergraph
 * @class
 *
 * http://en.wikipedia.org/wiki/Hypergraph
 *
 * @class
 * @param {Object} graph
 */

export default class Graph {
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
    var edges = this.edges

    var data = this.nodes[id]
    delete this.nodes[id]

    var incidentEdgeIds = getIncidentEdgeIds.bind(this)(id)
    incidentEdgeIds.forEach(delEdge.bind(this))

    return data
  }
}

module.exports = Graph
