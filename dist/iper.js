require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @param {Object} obj
 * @returns {Function}
 */

function staticProps (obj) {
  /**
   * @param {Object} props
   * @param {Boolean} [enumerable]
   */
  return function (props, enumerable) {
    var staticProps = {}

    for (var propName in props) {
      var staticProp = {
        configurable: false,
        enumerable: enumerable
      }
      var prop = props[propName]

      if (typeof prop === 'function') staticProp.get = prop
      else {
        staticProp.value = prop

        staticProp.writable = false
      }

      staticProps[propName] = staticProp
    }
    Object.defineProperties(obj, staticProps)
  }
}
module.exports = staticProps

},{}],2:[function(require,module,exports){
// In browserify context, *strict-mode* fall back to a no op.
module.exports = function (cb) { cb() }

},{}],3:[function(require,module,exports){
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

    const id = this.generateId()

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
    const id = this.generateId()

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

  /**
   * Generate a random string to be used as id.
   * Override this method if you want to customize id generation.
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

},{"./getDegree":4,"./getIncidentEdgeIds":5,"./getRank":6,"static-props":1}],4:[function(require,module,exports){
/**
 * The degree of a vertex is the number of incident edges, with loops counted twice.
 *
 * http://en.wikipedia.org/wiki/Degree_(graph_theory)
 *
 * @param {Object} edges
 * @param {String} nodeId
 * @returns {Number} degree
 */

const getDegree = (edges, nodeId) => {
  var degree = 0

  const countIncidents = (id) => {
    if (id === nodeId) {
      degree++
    }
  }

  for (var edgeId in edges) {
    var edge = edges[edgeId]

    edge.forEach(countIncidents)
  }

  return degree
}

module.exports = getDegree

},{}],5:[function(require,module,exports){
/**
 * Edges incident to given node
 *
 * @param {Object} edges
 * @param {String} nodeId
 * @returns {Array} incidentEdgeIds
 */

const getIncidentEdgeIds = (edges, nodeId) => {
  var incidentEdgeIds = []

  const pushUniqueIncidents = (edgeId, nodeId, id) => {
    var isIncident = (id === nodeId)
    var isUnique = (incidentEdgeIds.indexOf(edgeId) < 0)

    if (isIncident && isUnique) {
      incidentEdgeIds.push(edgeId)
    }
  }

  for (var edgeId in edges) {
    var edge = edges[edgeId]

    edge.forEach(pushUniqueIncidents.bind(null, edgeId, nodeId))
  }

  return incidentEdgeIds
}

module.exports = getIncidentEdgeIds

},{}],6:[function(require,module,exports){
/**
  The rank is the maximum cardinality of any of the edges in the hypergraph
 *
 * @params {Object} edges
 * @returns {Number} rank
 */

const getRank = (edges) => {
  var rank = 0

  for (var edgeId in edges) {
    var edge = edges[edgeId]
    rank = Math.max(rank, edge.length)
  }

  return rank
}

module.exports = getRank

},{}],"iper":[function(require,module,exports){
require('strict-mode')(() => {
  exports.Graph = require('./Graph')
})

},{"./Graph":3,"strict-mode":2}]},{},[]);
