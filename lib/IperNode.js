
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
}

util.inherits(IperNode, IperElement)

// remove
function remove () {
  this.graph.removeNode(this.id)
}
IperNode.prototype.remove = remove

module.exports = IperNode

