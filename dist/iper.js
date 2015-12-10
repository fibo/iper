require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var getIncidentEdgeIds = require('./getIncidentEdgeIds'),
    getOrphanEdgeIds = require('./getOrphanEdgeIds'),
    uniqueId = require('./uniqueId');

/**
 * Hypergraph
 * @class
 *
 * http://en.wikipedia.org/wiki/Hypergraph
 *
 * @param {Object} graph
 */

function Graph() {
  var arg = arguments[0] || {};

  this.edges = arg.edges || {};
  this.nodes = arg.nodes || {};
}

/**
 *
 * @param {Array} nodeIds
 * @returns {String} id
 */

function addEdge(nodeIds) {
  var id = uniqueId();

  this.edges[id] = nodeIds;

  return id;
}

Graph.prototype.addEdge = addEdge;

/**
 *
 * @param {Any} data
 * @returns {String} id
 */

function addNode(data) {
  var id = uniqueId();

  this.nodes[id] = data;

  return id;
}

Graph.prototype.addNode = addNode;

/**
 *
 * @param {String} id
 * @returns
 */

function delEdge(id) {
  var nodeIds = this.edges[id];

  delete this.edges[id];

  return nodeIds;
}

Graph.prototype.delEdge = delEdge;

/**
 *
 * @param {String} id
 * @returns {Any} data
 */

function delNode(id) {
  var edges = this.edges;

  var data = this.nodes[id];
  delete this.nodes[id];

  var incidentEdgeIds = getIncidentEdgeIds.bind(this)(id);
  incidentEdgeIds.forEach(delEdge.bind(this));

  return data;
}

Graph.prototype.delNode = delNode;

module.exports = Graph;

},{"./getIncidentEdgeIds":4,"./getOrphanEdgeIds":5,"./uniqueId":8}],2:[function(require,module,exports){
"use strict"

/**
 * Compute adjacent nodes
 *
 * @param {String} nodeId
 * @returns {Array} adjacentNodeIds
 */

;
function getAdjacentNodeIds(nodeId) {
  var adjacentNodeIds = [];

  var edges = this.edges;

  function givenNodeId(id) {
    return id !== nodeId;
  }

  function foundNodeIds(id) {
    return adjacentNodeIds.indexOf(id) === -1;
  }

  for (var edgeId in edges) {
    var edge = edges[edgeId];

    // Nothing to do if edge does not contain nodeId.
    if (edge.indexOf(nodeId) === -1) continue;

    // Take all nodeIds except given nodeId, avoid repetitions.
    var nodeIds = edge.filter(givenNodeId).filter(foundNodeIds);

    adjacentNodeIds = adjacentNodeIds.concat(nodeIds);
  }

  return adjacentNodeIds;
}

module.exports = getAdjacentNodeIds;

},{}],3:[function(require,module,exports){
"use strict"

/**
 * The degree of a vertex is the number of incident edges, with loops counted twice.
 * 
 * http://en.wikipedia.org/wiki/Degree_(graph_theory)
 * 
 * @param {String} nodeId
 * @returns {Number} degree
 */

;
function getDegree(nodeId) {
  var degree = 0;

  var edges = this.edges;

  function countIncidents(id) {
    if (id === nodeId) degree++;
  }

  for (var edgeId in edges) {
    var edge = edges[edgeId];

    edge.forEach(countIncidents);
  }

  return degree;
}

module.exports = getDegree;

},{}],4:[function(require,module,exports){
"use strict"

/**
 * Edges incident to given node
 * 
 * @param {String} nodeId
 * @returns {Array} incidentEdgeIds
 */

;
function getIncidentEdgeIds(nodeId) {
  var incidentEdgeIds = [];

  var edges = this.edges;

  function pushUniqueIncidents(edgeId, nodeId, id) {
    var isIncident = id === nodeId,
        isUnique = incidentEdgeIds.indexOf(edgeId) < 0;

    if (isIncident && isUnique) incidentEdgeIds.push(edgeId);
  }

  for (var edgeId in edges) {
    var edge = edges[edgeId];

    edge.forEach(pushUniqueIncidents.bind(null, edgeId, nodeId));
  }

  return incidentEdgeIds;
}

module.exports = getIncidentEdgeIds;

},{}],5:[function(require,module,exports){
'use strict'

/**
 * Compute edges which does not refer to existing nodeIds
 *
 * @param {Object} graph
 * @returns {Array} orphanEdgeIds
 */

;
function getOrphanEdgeIds() {
  var orphanEdgeIds = [];

  var edges = this.edges,
      nodes = this.nodes;

  function nodeIdsNotFound(nodeId) {
    return typeof nodes[nodeId] === 'undefined';
  }

  for (var edgeId in edges) {
    var edge = edges[edgeId];

    if (edge.filter(nodeIdsNotFound).length > 0) orphanEdgeIds.push(edgeId);
  }

  return orphanEdgeIds;
}

module.exports = getOrphanEdgeIds;

},{}],6:[function(require,module,exports){
"use strict"

/**
  The rank is the maximum cardinality of any of the edges in the hypergraph
 *
 * @returns {Number} rank
 */

;
function getRank() {
  var rank = 0;

  var edges = this.edges;

  for (var edgeId in edges) {
    var edge = edges[edgeId];

    rank = Math.max(rank, edge.length);
  }

  return rank;
}

module.exports = getRank;

},{}],7:[function(require,module,exports){
'use strict';

exports.Graph = require('./Graph');

exports.getAdjacentNodeIds = require('./getAdjacentNodeIds');
exports.getDegree = require('./getDegree');
exports.getIncidentEdgeIds = require('./getIncidentEdgeIds');
exports.getOrphanEdgeIds = require('./getOrphanEdgeIds');
exports.getRank = require('./getRank');

},{"./Graph":1,"./getAdjacentNodeIds":2,"./getDegree":3,"./getIncidentEdgeIds":4,"./getOrphanEdgeIds":5,"./getRank":6}],8:[function(require,module,exports){
'use strict';

var nextId = 0;

/**
 * Get unique identifier.
 *
 * @returns {String} nextId
 */

function uniqueId() {
  return ++nextId + '';
}

module.exports = uniqueId;

},{}],"iper":[function(require,module,exports){
'use strict';

module.exports = require('./build');

},{"./build":7}]},{},[]);
