const no = require('not-defined')
const staticProps = require('static-props')

const getDegree = require('./getDegree')
const getIncidentEdgeIds = require('./getIncidentEdgeIds')
const getRank = require('./getRank')

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
 * @param {Number} [graph.uniform] all edges has the same cardinality (i.e. number of nodes)
 *
 * @class
 */

class Graph {
  constructor () {
    const arg = arguments[0] || {}
    var obj = {}

    if (arg.uniform) {
      if (Number.isInteger(arg.uniform)) {
        if (arg.uniform < 2) {
          throw new TypeError('Argument uniform cannot be less than 2')
        } else {
          obj.uniform = arg.uniform
        }
      } else {
        throw new TypeError('Argument uniform must be an integer')
      }
    }

    if (arg.multigraph === true) obj.multigraph = true

    if (arg.pseudograph === true) {
      obj.multigraph = true
      obj.pseudograph = true
    }

    obj.edges = arg.edges || {}
    obj.nodes = arg.nodes || {}

    const enumerable = true
    staticProps(this)(obj, enumerable)
  }

  /**
   * Add an hyperedge that connects given nodeIds.
   *
   * @param {Array} nodeIds
   * @returns {String} id
   */

  addEdge (nodeIds) {
    if (nodeIds.length < 2) {
      throw new Error('An edge must point at two or more nodes')
    }

    const uniform = this.uniform

    if (uniform) {
      const cardinality = nodeIds.length

      if (uniform !== cardinality) {
        throw new Error(`Cannot add an edge with cardinality ${cardinality} to a ${uniform}-uniform graph`)
      }
    }

    if (!this.pseudograph) {
      const uniqNodeIds = nodeIds.filter((id, i) => nodeIds.indexOf(id) === i)
      const foundDuplicates = (uniqNodeIds.length < nodeIds.length)

      if (foundDuplicates) {
        throw new Error('This is not a pseudograph, it is not allowed to create loops')
      }
    }

    if (!this.multigraph) {
      for (let edgeId in this.edges) {
        let edge = this.edges[edgeId]

        const newEdgeAlreadyExists = (JSON.stringify(nodeIds) === JSON.stringify(edge))

        if (newEdgeAlreadyExists) {
          throw new Error('This is not a multigraph, you cannot add duplicated edges')
        }
      }
    }

    const nodeIdsNotFound = nodeIds.filter((id) => {
      return !this.nodes.hasOwnProperty(id)
    })

    if (nodeIdsNotFound.length > 0) {
      throw new Error('Edge points to some nodeId not found in this graph; ' + nodeIdsNotFound.join(','))
    }

    const id = this._generateUniqueId()

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
    const id = this._generateUniqueId()

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
   * @param {String} edgeId
   *
   * @returns {void}
   */

  delEdge (edgeId) {
    delete this.edges[edgeId]
  }

  /**
   * Delete node by given id.
   * The node id will be removed from every edge connected.
   * If some edge after this operation will result having only
   * one or zero vertices left, it will be removed too.
   *
   * @param {String} nodeId
   *
   * @returns {void}
   */

  delNode (nodeId) {
    delete this.nodes[nodeId]

    const incidentEdgeIds = getIncidentEdgeIds(this.edges, nodeId)

    incidentEdgeIds.forEach((edgeId) => {
      // Remove all nodeIds found in edge.
      while (this.edges[edgeId].indexOf(nodeId) > -1) {
        this.edges[edgeId].splice(this.edges[edgeId].indexOf(nodeId), 1)
      }

      // If edge has one or zero vertices left, remove it.
      if (this.edges[edgeId].length < 2) {
        this.delEdge(edgeId)
      }
    })
  }

  /**
   * Generate a random string to be used as id.
   * Override this method if you want to customize id generation.
   * This method is called by a wrapper which ensures the id generated
   * was not used yet.
   *
   * @returns {String} id
   */

  generateId () {
    const length = 4
    var result = ''

    while (result.length < length) {
      result += String.fromCharCode(97 + Math.floor(Math.random() * 26))
    }

    return result
  }

  /**
   * Generate an id and make sure it is unique.
   *
   * @returns {String} id
   */

  _generateUniqueId () {
    const id = this.generateId()

    if (no(this.edges[id]) && no(this.nodes[id])) {
      return id
    } else {
      return this._generateUniqueId()
    }
  }

  /**
   * Returns the max cardinality of any of the edges in the hypergraph.
   *
   * @returns {Number} rank
   */

  getRank () {
    if (this.uniform) return this.uniform

    return getRank(this.edges)
  }
}

module.exports = Graph
