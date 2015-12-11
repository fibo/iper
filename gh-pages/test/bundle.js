(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = require('./src');

},{"./src":10}],2:[function(require,module,exports){

// Cheating npm require.
module.exports = require('../..')


},{"../..":1}],3:[function(require,module,exports){

// IN browserify context, fall back to a no op
module.exports = function (cb) { cb() }


},{}],4:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var getIncidentEdgeIds = require('./getIncidentEdgeIds');
var getOrphanEdgeIds = require('./getOrphanEdgeIds');
var uniqueId = require('./uniqueId');

/**
 * Hypergraph
 * @class
 *
 * http://en.wikipedia.org/wiki/Hypergraph
 *
 * @class
 * @param {Object} graph
 */

var Graph = (function () {
  function Graph() {
    _classCallCheck(this, Graph);

    var arg = arguments[0] || {};

    this.edges = arg.edges || {};
    this.nodes = arg.nodes || {};
  }

  /**
   *
   * @param {Array} nodeIds
   * @returns {String} id
   */

  _createClass(Graph, [{
    key: 'addEdge',
    value: function addEdge(nodeIds) {
      var id = uniqueId();

      this.edges[id] = nodeIds;

      return id;
    }

    /**
     *
     * @param {Any} data
     * @returns {String} id
     */

  }, {
    key: 'addNode',
    value: function addNode(data) {
      var id = uniqueId();

      this.nodes[id] = data;

      return id;
    }

    /**
     *
     * @param {String} id
     * @returns
     */

  }, {
    key: 'delEdge',
    value: function delEdge(id) {
      var nodeIds = this.edges[id];

      delete this.edges[id];

      return nodeIds;
    }

    /**
     *
     * @param {String} id
     * @returns {Any} data
     */

  }, {
    key: 'delNode',
    value: function delNode(id) {
      var data = this.nodes[id];
      delete this.nodes[id];

      var incidentEdgeIds = getIncidentEdgeIds(this.edges, id);

      for (var edgeId in incidentEdgeIds) {
        this.delEdge(edgeId);
      }

      return data;
    }
  }]);

  return Graph;
})();

module.exports = Graph;

},{"./getIncidentEdgeIds":7,"./getOrphanEdgeIds":8,"./uniqueId":11}],5:[function(require,module,exports){
"use strict";

/**
 * Compute adjacent nodes
 *
 * @param {Array} edges
 * @param {String} nodeId
 * @returns {Array} adjacentNodeIds
 */

var getAdjacentNodeIds = function getAdjacentNodeIds(edges, nodeId) {
  var adjacentNodeIds = [];

  var givenNodeId = function givenNodeId(id) {
    return id !== nodeId;
  };

  var foundNodeIds = function foundNodeIds(id) {
    return adjacentNodeIds.indexOf(id) === -1;
  };

  for (var edgeId in edges) {
    var edge = edges[edgeId];

    // Nothing to do if edge does not contain nodeId.
    if (edge.indexOf(nodeId) === -1) {
      continue;
    }

    // Take all nodeIds except given nodeId, avoid repetitions.
    var nodeIds = edge.filter(givenNodeId).filter(foundNodeIds);

    adjacentNodeIds = adjacentNodeIds.concat(nodeIds);
  }

  return adjacentNodeIds;
};

module.exports = getAdjacentNodeIds;

},{}],6:[function(require,module,exports){
"use strict";

/**
 * The degree of a vertex is the number of incident edges, with loops counted twice.
 *
 * http://en.wikipedia.org/wiki/Degree_(graph_theory)
 *
 * @param {Array} edges
 * @param {String} nodeId
 * @returns {Number} degree
 */

var getDegree = function getDegree(edges, nodeId) {
  var degree = 0;

  var countIncidents = function countIncidents(id) {
    if (id === nodeId) {
      degree++;
    }
  };

  for (var edgeId in edges) {
    var edge = edges[edgeId];

    edge.forEach(countIncidents);
  }

  return degree;
};

module.exports = getDegree;

},{}],7:[function(require,module,exports){
"use strict";

/**
 * Edges incident to given node
 *
 * @param {Array} edges
 * @param {String} nodeId
 * @returns {Array} incidentEdgeIds
 */

var getIncidentEdgeIds = function getIncidentEdgeIds(edges, nodeId) {
  var incidentEdgeIds = [];

  var pushUniqueIncidents = function pushUniqueIncidents(edgeId, nodeId, id) {
    var isIncident = id === nodeId;
    var isUnique = incidentEdgeIds.indexOf(edgeId) < 0;

    if (isIncident && isUnique) incidentEdgeIds.push(edgeId);
  };

  for (var edgeId in edges) {
    var edge = edges[edgeId];

    edge.forEach(pushUniqueIncidents.bind(null, edgeId, nodeId));
  }

  return incidentEdgeIds;
};

module.exports = getIncidentEdgeIds;

},{}],8:[function(require,module,exports){
'use strict';

/**
 * Compute edges which does not refer to existing nodeIds
 *
 * @param {Array} edges
 * @param {Array} nodes
 * @param {Object} graph
 * @returns {Array} orphanEdgeIds
 */

var getOrphanEdgeIds = function getOrphanEdgeIds(edges, nodes) {
  var orphanEdgeIds = [];

  var nodeIdsNotFound = function nodeIdsNotFound(nodeId) {
    return typeof nodes[nodeId] === 'undefined';
  };

  for (var edgeId in edges) {
    var edge = edges[edgeId];

    if (edge.filter(nodeIdsNotFound).length > 0) {
      orphanEdgeIds.push(edgeId);
    }
  }

  return orphanEdgeIds;
};

module.exports = getOrphanEdgeIds;

},{}],9:[function(require,module,exports){
"use strict";

/**
  The rank is the maximum cardinality of any of the edges in the hypergraph
 *
 * @params {Array} edges
 * @returns {Number} rank
 */

var getRank = function getRank(edges) {
  var rank = 0;

  for (var edgeId in edges) {
    var edge = edges[edgeId];
    rank = Math.max(rank, edge.length);
  }

  return rank;
};

module.exports = getRank;

},{}],10:[function(require,module,exports){
'use strict';

require('strict-mode')(function () {
  exports.Graph = require('./Graph');

  exports.getAdjacentNodeIds = require('./getAdjacentNodeIds');
  exports.getDegree = require('./getDegree');
  exports.getIncidentEdgeIds = require('./getIncidentEdgeIds');
  exports.getOrphanEdgeIds = require('./getOrphanEdgeIds');
  exports.getRank = require('./getRank');
});

},{"./Graph":4,"./getAdjacentNodeIds":5,"./getDegree":6,"./getIncidentEdgeIds":7,"./getOrphanEdgeIds":8,"./getRank":9,"strict-mode":3}],11:[function(require,module,exports){
'use strict';

var nextId = 0;

/**
 * Get unique identifier.
 *
 * @returns {String} nextId
 */

var uniqueId = function uniqueId() {
  return ++nextId + '';
};

module.exports = uniqueId;

},{}],12:[function(require,module,exports){
'use strict';

describe('Graph', function () {
  var Graph = require('iper').Graph;

  var nodeData1 = 'foo';
  var nodeData2 = ['bar'];

  var graph = new Graph();
  var nodeIds;
  var nodeId1;
  var nodeId2;
  var edgeId1;

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

},{"iper":2}],13:[function(require,module,exports){
module.exports={
  "nodes": {
    "1": "foo",
    "2": "bar"
  },
  "edges": {
    "0": ["1", "2"]
  }
}

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
module.exports={
  "nodes": {
    "0": "foo"
  },
  "edges": {
    "1": ["0", "0"]
  }
}

},{}],17:[function(require,module,exports){
module.exports={
  "nodes": {
    "1": "foo",
    "2": "bar"
  },
  "edges": {
    "0": ["3", "2"]
  } 
}

},{}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
'use strict';

describe('getAdjacentNodeIds', function () {
  var getAdjacentNodeIds = require('iper').getAdjacentNodeIds;

  var graph1 = require('./examples/graphs/graph1.json');
  var graph2 = require('./examples/graphs/graph2.json');

  it('is mutual', function () {
    var edges = graph1.edges;
    var nodeId1 = '1';
    var nodeId2 = '2';

    getAdjacentNodeIds(edges, nodeId1).should.be.eql([nodeId2]);
    getAdjacentNodeIds(edges, nodeId2).should.be.eql([nodeId1]);
  });

  it('returns an empty array if there is no adjacent node', function () {
    var edges = graph1.edges;
    var nodeId = 'not found';

    getAdjacentNodeIds(edges, nodeId).should.be.eql([]);
  });

  it('returns adjacent nodes', function () {
    var edges = graph2.edges;
    var nodeId;

    nodeId = 'a';
    getAdjacentNodeIds(edges, nodeId).should.be.eql(['b', 'c']);

    nodeId = 'b';
    getAdjacentNodeIds(edges, nodeId).should.be.eql(['a', 'c']);
  });
});

},{"./examples/graphs/graph1.json":13,"./examples/graphs/graph2.json":14,"iper":2}],20:[function(require,module,exports){
'use strict';

describe('getDegree', function () {
  var getDegree = require('iper').getDegree;

  var graph1 = require('./examples/graphs/graph1.json');
  var isolatedNode = require('./examples/graphs/isolatedNode.json');
  var loop1 = require('./examples/graphs/loop1.json');

  it('returns number of incident edges', function () {
    var edges = graph1.edges;
    getDegree(edges, '1').should.be.eql(1);
    getDegree(edges, '2').should.be.eql(1);
  });

  it('is 0 for isolated nodes', function () {
    var edges = isolatedNode.edges;
    getDegree(edges, 'isolated').should.be.eql(0);
  });

  it('counts loops twice', function () {
    var edges = loop1.edges;
    getDegree(edges, '0').should.be.eql(2);
  });
});

},{"./examples/graphs/graph1.json":13,"./examples/graphs/isolatedNode.json":15,"./examples/graphs/loop1.json":16,"iper":2}],21:[function(require,module,exports){
'use strict';

describe('getIncidentEdgeIds', function () {
  var getIncidentEdgeIds = require('iper').getIncidentEdgeIds;

  var graph1 = require('./examples/graphs/graph1.json');
  var graph2 = require('./examples/graphs/graph2.json');
  var isolatedNode = require('./examples/graphs/isolatedNode.json');

  var edges;
  var nodeId;

  it('returns an empty array if there is no incident edge', function () {
    //nodeId = 'isolated'
    //edges = isolatedNode.edges
    //getIncidentEdgeIds(edges, nodeId).should.be.eql([])
  });

  it('returns incident edges', function () {
    var result;

    nodeId = '1';
    edges = graph1.edges;
    result = ['0'];
    getIncidentEdgeIds(edges, nodeId).should.be.eql(result);

    nodeId = '2';
    edges = graph1.edges;
    result = ['0'];
    getIncidentEdgeIds(edges, nodeId).should.be.eql(result);

    nodeId = 'a';
    edges = graph2.edges;
    result = ['0', '1', '2'];
    getIncidentEdgeIds(edges, nodeId).should.be.eql(result);

    nodeId = 'b';
    edges = graph2.edges;
    result = ['0', '1', '2'];
    getIncidentEdgeIds(edges, nodeId).should.be.eql(result);

    nodeId = 'c';
    edges = graph2.edges;
    result = ['0', '1', '2'];
    getIncidentEdgeIds(edges, nodeId).should.be.eql(result);
  });
});

},{"./examples/graphs/graph1.json":13,"./examples/graphs/graph2.json":14,"./examples/graphs/isolatedNode.json":15,"iper":2}],22:[function(require,module,exports){
'use strict';

describe('getOrphanEdgeIds', function () {
  var getOrphanEdgeIds = require('iper').getOrphanEdgeIds;

  var graph1 = require('./examples/graphs/graph1.json');
  var orphanEdges1 = require('./examples/graphs/orphanEdges1.json');
  var orphanEdges2 = require('./examples/graphs/orphanEdges2.json');

  it('returns orphan edges', function () {
    getOrphanEdgeIds(orphanEdges1.edges, orphanEdges1.nodes).should.be.eql(['0']);

    getOrphanEdgeIds(orphanEdges2.edges, orphanEdges2.nodes).should.be.eql(['3', '6']);
  });

  it('returns an empty array if there is no orphan edge', function () {
    var edges = graph1.edges;
    var nodes = graph1.nodes;

    getOrphanEdgeIds(edges, nodes).should.be.eql([]);
  });
});

},{"./examples/graphs/graph1.json":13,"./examples/graphs/orphanEdges1.json":17,"./examples/graphs/orphanEdges2.json":18,"iper":2}],23:[function(require,module,exports){
'use strict';

describe('getRank', function () {
  var getRank = require('iper').getRank;

  var graph1 = require('./examples/graphs/graph1.json');
  var graph2 = require('./examples/graphs/graph2.json');

  it('returns the maximum cardinality of the edges', function () {
    getRank(graph1.edges).should.be.eql(2);
    getRank(graph2.edges).should.be.eql(3);
  });
});

},{"./examples/graphs/graph1.json":13,"./examples/graphs/graph2.json":14,"iper":2}]},{},[12,19,20,21,22,23]);
