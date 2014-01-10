
//
// # IperNode
//
// A node in an hypergraph.
//

var _        = require('underscore')
  , inherits = require('inherits')

var IperElement = require('./IperElement')

function IperNode(graph, opts) {
  var self = this

  IperElement.call(this, graph)

  if (!_.isObject(opts))
    opts = {}

  //
  // ## Attributes
  //

  //
  // ### degree
  //
  // It is the number of edges incident to the vertex.
  //
  // See also [degree on wikipedia](http://en.wikipedia.org/wiki/Degree_(graph_theory)).
  //

  function getDegree () {
    var degree = 0

    /* Count occurrences of node id in edge.nodeIds
     * for every edge in the graph.
     */
    _.each(graph.edges, function (edge) {
      _.each(edge.nodeIds, function (nodeId) {
        if (nodeId === self.id)
          degree++
      })
    })

    return degree
  }

  Object.defineProperty(this, 'degree', {get: getDegree})

  //
  // ### maxDegree
  //

  function getMaxDegree () {
    return opts.maxDegree
  }

  Object.defineProperty(this, 'maxDegree', {get: getMaxDegree})
}

inherits(IperNode, IperElement)

//
// ## Methods
//

//
// ### getAdjacentNodeIds()
//

function getAdjacentNodeIds() {
  var self = this

  var adjacentNodeIds = []

  /* loop over all edges */
  _.each(self.graph.edges, function (edge) {
    /* if edge contains node */
    if (_.contains(edge.nodeIds, self.id))
      /* take all nodeIds except node self id */
      adjacentNodeIds.push(_.without(edge.nodeIds, self.id))
  })

  /* since _.without() return an array and nodeIds can be repeated,
   * use _.uniq() and _.flatten() to return a flat array with no repetition
   */
  return _.uniq(_.flatten(adjacentNodeIds))
}

IperNode.prototype.getAdjacentNodeIds = getAdjacentNodeIds

module.exports = IperNode

