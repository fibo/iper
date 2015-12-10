(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
'use strict';

module.exports = require('./build');

},{"./build":7}],10:[function(require,module,exports){

// Cheating npm require.
module.exports = require('../..')


},{"../..":9}],11:[function(require,module,exports){
'use strict';

var _iper = require('iper');

var graph = new _iper.Graph();
var nodeIds = undefined;
var nodeData1 = 'foo';
var nodeData2 = ['bar'];
var edgeId1 = undefined;
var nodeId1 = undefined;
var nodeId2 = undefined;

describe('Graph', function () {
  describe('addNode()', function () {
    it('creates a node', function () {
      nodeId1 = graph.addNode(nodeData1);
      graph.nodes[nodeId1].should.be.eql(nodeData1);
    });

    it('returns an id', function () {
      nodeId2 = graph.addNode(nodeData2);
      nodeId2.should.be.a.String;
    });
  });

  describe('addEdge()', function () {
    it('creates an edge', function () {
      nodeIds = [nodeId1, nodeId2];
      edgeId1 = graph.addEdge(nodeIds);
      graph.edges[edgeId1].should.be.eql(nodeIds);
    });

    it('returns an id', function () {
      edgeId1.should.be.a.String;
    });
  });

  describe('delNode()', function () {
    it('removes a node', function () {
      graph.delNode(nodeId1);

      var nodeNotDefined = typeof graph.nodes[nodeId1] === 'undefined';
      nodeNotDefined.should.be.true;
    });

    it('removes incident edges', function () {
      var incidentEdgeRemoved = typeof graph.edges[edgeId1] === 'undefined';
      incidentEdgeRemoved.should.be.true;
    });

    it('returns node data', function () {
      graph.delNode(nodeId2).should.be.eql(nodeData2);
    });
  });

  describe('delEdge()', function () {
    it('removes an edge, returns nodeIds', function () {
      nodeId1 = graph.addNode(nodeData1);
      nodeId2 = graph.addNode(nodeData2);
      nodeIds = [nodeId1, nodeId2];
      edgeId1 = graph.addEdge(nodeIds);

      graph.delEdge(edgeId1).should.be.eql(nodeIds);

      var edgeNotDefined = typeof graph.edges[edgeId1] === 'undefined';
      edgeNotDefined.should.be.true;
    });
  });
});

},{"iper":10}],12:[function(require,module,exports){
module.exports={
  "nodes": {
    "1": "foo",
    "2": "bar"
  },
  "edges": {
    "0": ["1", "2"]
  } 
}

},{}],13:[function(require,module,exports){
module.exports={
  "edges": {
    "0": ["a", "b", "c"],
    "1": ["b", "c", "a"],
    "2": ["c", "a", "b"]
  },
  "nodes": {
    "a": 1,
    "b": 2,
    "c": 3
  }
}

},{}],14:[function(require,module,exports){
module.exports={
  "nodes": {
    "isolated": "node",
    "another": ["node"],
    "yet": {"another": 1}
  },
  "edges": {
    "0": ["another", "yet"]
  }
}

},{}],15:[function(require,module,exports){
module.exports={
  "nodes": {
    "0": "foo"
  },
  "edges": {
    "1": ["0", "0"]
  }
}

},{}],16:[function(require,module,exports){
module.exports={
  "nodes": {
    "1": "foo",
    "2": "bar"
  },
  "edges": {
    "0": ["3", "2"]
  } 
}

},{}],17:[function(require,module,exports){
module.exports={
  "nodes": {
    "1": "foo",
    "2": "bar"
  },
  "edges": {
    "0": ["1", "2"],
    "3": ["4", "5"],
    "6": ["7", "8"]
  } 
}

},{}],18:[function(require,module,exports){
'use strict';

var _iper = require('iper');

var _graph = require('./examples/graphs/graph1.json');

var _graph2 = _interopRequireDefault(_graph);

var _graph3 = require('./examples/graphs/graph2.json');

var _graph4 = _interopRequireDefault(_graph3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getAdjacentNodeIds1 = _iper.getAdjacentNodeIds.bind(_graph2.default);
var getAdjacentNodeIds2 = _iper.getAdjacentNodeIds.bind(_graph4.default);

describe('getAdjacentNodeIds', function () {
  it('is mutual', function () {
    var nodeId1 = '1';
    var nodeId2 = '2';

    getAdjacentNodeIds1(nodeId1).should.be.eql([nodeId2]);
    getAdjacentNodeIds1(nodeId2).should.be.eql([nodeId1]);
  });

  it('returns an empty array if there is no adjacent node', function () {
    var nodeId = 'not found';
    getAdjacentNodeIds1(nodeId).should.be.eql([]);
  });

  it('returns adjacent nodes', function () {
    var nodeId = undefined;

    nodeId = 'a';
    getAdjacentNodeIds2(nodeId).should.be.eql(['b', 'c']);

    nodeId = 'b';
    getAdjacentNodeIds2(nodeId).should.be.eql(['a', 'c']);
  });
});

},{"./examples/graphs/graph1.json":12,"./examples/graphs/graph2.json":13,"iper":10}],19:[function(require,module,exports){
'use strict';

var _iper = require('iper');

var _graph = require('./examples/graphs/graph1.json');

var _graph2 = _interopRequireDefault(_graph);

var _isolatedNode = require('./examples/graphs/isolatedNode.json');

var _isolatedNode2 = _interopRequireDefault(_isolatedNode);

var _loop = require('./examples/graphs/loop1.json');

var _loop2 = _interopRequireDefault(_loop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getDegree1 = _iper.getDegree.bind(_graph2.default);
var getDegreeOfIsolatedNode = _iper.getDegree.bind(_graph2.default);
var getDegreeOfLoop1 = _iper.getDegree.bind(_loop2.default);

describe('getDegree', function () {
  it('returns number of incident edges', function () {
    getDegree1('1').should.be.eql(1);
    getDegree1('2').should.be.eql(1);
  });

  it('is 0 for isolated nodes', function () {
    getDegreeOfIsolatedNode('isolated').should.be.eql(0);
  });

  it('counts loops twice', function () {
    getDegreeOfLoop1('0').should.be.eql(2);
  });
});

},{"./examples/graphs/graph1.json":12,"./examples/graphs/isolatedNode.json":14,"./examples/graphs/loop1.json":15,"iper":10}],20:[function(require,module,exports){
'use strict';

var _iper = require('iper');

var _graph = require('./examples/graphs/graph1.json');

var _graph2 = _interopRequireDefault(_graph);

var _graph3 = require('./examples/graphs/graph2.json');

var _graph4 = _interopRequireDefault(_graph3);

var _isolatedNode = require('./examples/graphs/isolatedNode.json');

var _isolatedNode2 = _interopRequireDefault(_isolatedNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getIncidentEdgeIds1 = _iper.getIncidentEdgeIds.bind(_graph2.default);
var getIncidentEdgeIds2 = _iper.getIncidentEdgeIds.bind(_graph4.default);

describe('getIncidentEdgeIds', function () {
  it('returns an empty array if there is no incident edge', function () {
    var nodeId = 'isolated';
    _iper.getIncidentEdgeIds.bind(_isolatedNode2.default)(nodeId).should.be.eql([]);
  });

  it('returns incident edges', function () {
    var nodeId = undefined;

    nodeId = '1';
    getIncidentEdgeIds1(nodeId).should.be.eql(['0']);

    nodeId = '2';
    getIncidentEdgeIds1(nodeId).should.be.eql(['0']);

    nodeId = 'a';
    getIncidentEdgeIds2(nodeId).should.be.eql(['0', '1', '2']);

    nodeId = 'b';
    getIncidentEdgeIds2(nodeId).should.be.eql(['0', '1', '2']);

    nodeId = 'c';
    getIncidentEdgeIds2(nodeId).should.be.eql(['0', '1', '2']);
  });
});

},{"./examples/graphs/graph1.json":12,"./examples/graphs/graph2.json":13,"./examples/graphs/isolatedNode.json":14,"iper":10}],21:[function(require,module,exports){
'use strict';

var _iper = require('iper');

var _graph = require('./examples/graphs/graph1.json');

var _graph2 = _interopRequireDefault(_graph);

var _orphanEdges = require('./examples/graphs/orphanEdges1.json');

var _orphanEdges2 = _interopRequireDefault(_orphanEdges);

var _orphanEdges3 = require('./examples/graphs/orphanEdges2.json');

var _orphanEdges4 = _interopRequireDefault(_orphanEdges3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('getOrphanEdgeIds', function () {
  it('returns orphan edges', function () {
    _iper.getOrphanEdgeIds.bind(_orphanEdges2.default)().should.be.eql(['0']);

    _iper.getOrphanEdgeIds.bind(_orphanEdges4.default)().should.be.eql(['3', '6']);
  });

  it('returns an empty array if there is no orphan edge', function () {
    _iper.getOrphanEdgeIds.bind(_graph2.default)().should.be.eql([]);
  });
});

},{"./examples/graphs/graph1.json":12,"./examples/graphs/orphanEdges1.json":16,"./examples/graphs/orphanEdges2.json":17,"iper":10}],22:[function(require,module,exports){
'use strict';

var _iper = require('iper');

var _graph = require('./examples/graphs/graph1.json');

var _graph2 = _interopRequireDefault(_graph);

var _graph3 = require('./examples/graphs/graph2.json');

var _graph4 = _interopRequireDefault(_graph3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getRank1 = _iper.getRank.bind(_graph2.default);
var getRank2 = _iper.getRank.bind(_graph4.default);

describe('getRank', function () {
  it('returns the maximum cardinality of the edges', function () {
    getRank1().should.be.eql(2);
    getRank2().should.be.eql(3);
  });
});

},{"./examples/graphs/graph1.json":12,"./examples/graphs/graph2.json":13,"iper":10}]},{},[11,18,19,20,21,22]);
