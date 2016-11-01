const isequal = require('lodash.isequal')
const uniqueid = require('lodash.uniqueid')
const uniqby = require('lodash.uniqby')
const staticProps = require('static-props')

const getDegree = require('./getDegree')
const getIncidentEdgeIds = require('./getIncidentEdgeIds')

/**
 * Hypergraph
 *
 * http://en.wikipedia.org/wiki/Hypergraph
 *
 * @param {Object} [graph]
 * @param {Object} [graph.edges]
 * @param {Object} [graph.nodes]
 * @param {Boolean} [graph.multigraph] can contain duplicated edges
 * @param {Boolean} [graph.pseudograph] is a multigraph with loops allowed
 * @class
 */

// TODO add options like
// * rank, maxDegree, etc
// if it is directed, an a -> b edge is different from b -> a
class Graph {
  constructor () {
    const arg = arguments[0] || {}
    var obj = {}

    if (arg.multigraph === true) obj.multigraph = true

    if (arg.pseudograph === true) {
      obj.multigraph = true
      obj.pseudograph = true
    }

    obj.edges = arg.edges || {}
    obj.nodes = arg.nodes || {}

    staticProps(this)(obj)
  }

  /**
   * Add an hyperedge that connects given nodeIds.
   *
   * @param {Array} nodeIds
   * @returns {String} id
   */

  addEdge (nodeIds) {
    if (!this.pseudograph) {
      if (uniqby(nodeIds).length < nodeIds.length) {
        throw new Error('This is not a pseudograph, it is not allowed to create loops')
      }
    }

    if (!this.multigraph) {
      for (let edgeId in this.edges) {
        let edge = this.edges[edgeId]

        if (isequal(nodeIds, edge)) {
          throw new Error('This is not a multigraph, you cannot add duplicated edges')
        }
      }
    }

    // TODO throw error nodeIds not found
    const id = uniqueid()

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
    const id = uniqueid()

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
