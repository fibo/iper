
//
// IperNode
// ========
//

var _    = require('underscore')
  , util = require('util')

var IperElement = require('./IperElement')

// Constructor

function IperNode(graph, data, meta) {
  var self = this

  // check graph
  if (_.isUndefined(graph))
    throw new Error()

  IperElement.call(this, graph)

  if (!_.isObject(meta))
    meta = {}

  // data
  var data

  function getData () { return data }

  Object.defineProperty(this, 'data', {get: getData})

  // degree
  function getDegree () {
    var degree = 0

    _.each(graph.edges, function (edge) {
      if (_.contains(edge.nodeIds, self.id))
        degree++
    })

    return degree
  }

  Object.defineProperty(this, 'degree', {get: getDegree})

  // maxDegree
  function getMaxDegree () {
    return meta.maxDegree
  }

  Object.defineProperty(this, 'maxDegree', {get: getMaxDegree})

  // register in graph
  graph.pushNode(self)
}

util.inherits(IperNode, IperElement)

// getAdjacentNodeIds
function getAdjacentNodeIds() {
  var self = this

  var adjacentNodeIds = []

  // loop over all edges
  _.each(self.graph.edges, function (edge) {
    // if edge contains node
    if (_.contains(edge.nodeIds, self.id))
      // take all nodeIds except node self id
      adjacentNodeIds.push(_.without(edge.nodeIds, self.id))
  })

  // since _.without() return an array and nodeIds can be repeated
  // use _.uniq() and _.flatten() to return a flat array with no repetition
  return _.uniq(_.flatten(adjacentNodeIds))
}
IperNode.prototype.getAdjacentNodeIds = getAdjacentNodeIds

// remove
function remove () {
  this.graph.removeNode(this.id)
}
IperNode.prototype.remove = remove

module.exports = IperNode

