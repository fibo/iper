(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./src')

},{"./src":11}],2:[function(require,module,exports){

// Cheating npm require.
module.exports = require('../..')


},{"../..":1}],3:[function(require,module,exports){
(function (global){
/**
 * lodash 3.1.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used for built-in method references. */
var objectProto = global.Object.prototype;

/** Used to generate unique IDs. */
var idCounter = 0;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var _Symbol = global.Symbol;

/** Used to convert symbols to primitives and strings. */
var symbolProto = _Symbol ? _Symbol.prototype : undefined,
    symbolToString = _Symbol ? symbolProto.toString : undefined;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a string if it's not one. An empty string is returned
 * for `null` and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (value == null) {
    return '';
  }
  if (isSymbol(value)) {
    return _Symbol ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Generates a unique ID. If `prefix` is provided the ID is appended to it.
 *
 * @static
 * @memberOf _
 * @category Util
 * @param {string} [prefix] The value to prefix the ID with.
 * @returns {string} Returns the unique ID.
 * @example
 *
 * _.uniqueId('contact_');
 * // => 'contact_104'
 *
 * _.uniqueId();
 * // => '105'
 */
function uniqueId(prefix) {
  var id = ++idCounter;
  return toString(prefix) + id;
}

module.exports = uniqueId;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
// In browserify context, *strict-mode* fall back to a no op.
module.exports = function (cb) { cb() }

},{}],5:[function(require,module,exports){
var getIncidentEdgeIds = require('./getIncidentEdgeIds')
var uniqueId = require('lodash.uniqueid')

/**
 * Hypergraph
 * @class
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

},{"./getIncidentEdgeIds":8,"lodash.uniqueid":3}],6:[function(require,module,exports){
/**
 * Compute adjacent nodes
 *
 * @param {Array} edges
 * @param {String} nodeId
 * @returns {Array} adjacentNodeIds
 */

const getAdjacentNodeIds = (edges, nodeId) => {
  let adjacentNodeIds = []

  const givenNodeId = (id) => {
    return id !== nodeId
  }

  const foundNodeIds = (id) => {
    return adjacentNodeIds.indexOf(id) === -1
  }

  for (let edgeId in edges) {
    let edge = edges[edgeId]

    // Nothing to do if edge does not contain nodeId.
    if (edge.indexOf(nodeId) === -1) {
      continue
    }

    // Take all nodeIds except given nodeId, avoid repetitions.
    let nodeIds = edge.filter(givenNodeId)
                        .filter(foundNodeIds)

    adjacentNodeIds = adjacentNodeIds.concat(nodeIds)
  }

  return adjacentNodeIds
}

module.exports = getAdjacentNodeIds

},{}],7:[function(require,module,exports){
/**
 * The degree of a vertex is the number of incident edges, with loops counted twice.
 *
 * http://en.wikipedia.org/wiki/Degree_(graph_theory)
 *
 * @param {Array} edges
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

},{}],8:[function(require,module,exports){
/**
 * Edges incident to given node
 *
 * @param {Array} edges
 * @param {String} nodeId
 * @returns {Array} incidentEdgeIds
 */

const getIncidentEdgeIds = (edges, nodeId) => {
  let incidentEdgeIds = []

  const pushUniqueIncidents = (edgeId, nodeId, id) => {
    let isIncident = (id === nodeId)
    let isUnique = (incidentEdgeIds.indexOf(edgeId) < 0)

    if (isIncident && isUnique) {
      incidentEdgeIds.push(edgeId)
    }
  }

  for (let edgeId in edges) {
    let edge = edges[edgeId]

    edge.forEach(pushUniqueIncidents.bind(null, edgeId, nodeId))
  }

  return incidentEdgeIds
}

module.exports = getIncidentEdgeIds

},{}],9:[function(require,module,exports){
/**
 * Compute edges which does not refer to existing nodeIds
 *
 * @param {Array} edges
 * @param {Array} nodes
 * @param {Object} graph
 * @returns {Array} orphanEdgeIds
 */

const getOrphanEdgeIds = (edges, nodes) => {
  var orphanEdgeIds = []

  const nodeIdsNotFound = (nodeId) => {
    return typeof nodes[nodeId] === 'undefined'
  }

  for (var edgeId in edges) {
    var edge = edges[edgeId]

    if (edge.filter(nodeIdsNotFound).length > 0) {
      orphanEdgeIds.push(edgeId)
    }
  }

  return orphanEdgeIds
}

module.exports = getOrphanEdgeIds

},{}],10:[function(require,module,exports){
/**
  The rank is the maximum cardinality of any of the edges in the hypergraph
 *
 * @params {Array} edges
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

},{}],11:[function(require,module,exports){
require('strict-mode')(() => {
  exports.Graph = require('./Graph')

  exports.getAdjacentNodeIds = require('./getAdjacentNodeIds')
  exports.getDegree = require('./getDegree')
  exports.getIncidentEdgeIds = require('./getIncidentEdgeIds')
  exports.getOrphanEdgeIds = require('./getOrphanEdgeIds')
  exports.getRank = require('./getRank')
})

},{"./Graph":5,"./getAdjacentNodeIds":6,"./getDegree":7,"./getIncidentEdgeIds":8,"./getOrphanEdgeIds":9,"./getRank":10,"strict-mode":4}],12:[function(require,module,exports){
"use strict";
describe('Graph', () => {
  var Graph = require('iper').Graph

  var nodeData1 = 'foo'
  var nodeData2 = ['bar']

  var graph = new Graph()
  var nodeIds
  var nodeId1
  var nodeId2
  var edgeId1

  describe('addNode()', () => {
    it('creates a node', () => {
      nodeId1 = graph.addNode(nodeData1)
      graph.nodes[nodeId1].should.be.eql(nodeData1)
    })

    it('returns an id', () => {
      nodeId2 = graph.addNode(nodeData2)
      nodeId2.should.be.a.String
    })
  })

  describe('addEdge()', () => {
    it('creates an edge', () => {
      nodeIds = [nodeId1, nodeId2]
      edgeId1 = graph.addEdge(nodeIds)
      graph.edges[edgeId1].should.be.eql(nodeIds)
    })

    it('returns an id', () => {
      edgeId1.should.be.a.String
    })
  })

  describe('delNode()', () => {
    it('removes a node', () => {
      graph.delNode(nodeId1)

      var nodeNotDefined = (typeof graph.nodes[nodeId1] === 'undefined')
      nodeNotDefined.should.be.true
    })

    it('removes incident edges', () => {
      var incidentEdgeRemoved = (typeof graph.edges[edgeId1] === 'undefined')
      incidentEdgeRemoved.should.be.true
    })

    it('returns node data', () => {
      graph.delNode(nodeId2).should.be.eql(nodeData2)
    })
  })

  describe('delEdge()', () => {
    it('removes an edge, returns nodeIds', () => {
      nodeId1 = graph.addNode(nodeData1)
      nodeId2 = graph.addNode(nodeData2)
      nodeIds = [nodeId1, nodeId2]
      edgeId1 = graph.addEdge(nodeIds)

      graph.delEdge(edgeId1).should.be.eql(nodeIds)

      var edgeNotDefined = (typeof graph.edges[edgeId1] === 'undefined')
      edgeNotDefined.should.be.true
    })
  })
})

},{"iper":2}]},{},[12]);
