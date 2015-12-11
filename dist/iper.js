require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

// IN browserify context, fall back to a no op
module.exports = function (cb) { cb() }


},{}],2:[function(require,module,exports){
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

},{"./getIncidentEdgeIds":5,"./getOrphanEdgeIds":6,"./uniqueId":9}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
'use strict';

require('strict-mode')(function () {
  exports.Graph = require('./Graph');

  exports.getAdjacentNodeIds = require('./getAdjacentNodeIds');
  exports.getDegree = require('./getDegree');
  exports.getIncidentEdgeIds = require('./getIncidentEdgeIds');
  exports.getOrphanEdgeIds = require('./getOrphanEdgeIds');
  exports.getRank = require('./getRank');
});

},{"./Graph":2,"./getAdjacentNodeIds":3,"./getDegree":4,"./getIncidentEdgeIds":5,"./getOrphanEdgeIds":6,"./getRank":7,"strict-mode":1}],9:[function(require,module,exports){
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

},{}],"iper":[function(require,module,exports){
'use strict';

module.exports = require('./src');

},{"./src":8}]},{},[]);
