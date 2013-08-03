
//
// IperGraph
//

var _    = require('underscore')
  , util = require('util')

var IperEdge    = require('./IperEdge')
  , IperElement = require('./IperElement')
  , IperNode    = require('./IperNode')

function IperGraph(data) {

  IperElement.call(this)

  if (_.isUndefined(data))
    data = {nodes:{}, edges:{}}

  this.__defineGetter__('edges', function () { return this.data.edges })
  this.__defineGetter__('nodes', function () { return this.data.nodes })
}

util.inherits(IperGraph, IperNode)

function check(data) {
  // data.edges has existing nodeIds
  for (var edgeId in data.edges) {
    var edgeData = data.edges[edgeId]
    for (var i in edgeData) {
      var nodeId = edgeData[i]
      if (typeof data.nodes[nodeId] === 'undefined')
        throw new Error()
    }
  }
}

function createEdge() {
  return new IperEdge(arguments[0])
}
IperGraph.prototype.createEdge = createEdge

function readEdge(id) {
  return this.edges[id]
}
IperGraph.prototype.readEdge = readEdge

function updateEdge(id, nodeData) {
}
IperGraph.prototype.updateEdge = updateEdge

function deleteEdge(id) {
  delete this.edges[id]
}
IperGraph.prototype.deleteEdge = deleteEdge

function createNode(data) {
  var node = new IperNode(data)
  this.nodes[node.id] = node
  return node.id
}
IperGraph.prototype.createNode = createNode

function readNode(id) {
  var node = this.nodes[id]
  if (node instanceof IperNode)
    return node.data
}
IperGraph.prototype.readNode = readNode

function updateNode(id, nodeData) {
  this.nodes[id] = nodeData
}
IperGraph.prototype.updateNode = updateNode

function deleteNode(id) {
  delete this.nodes[id]
}
IperGraph.prototype.deleteNode = deleteNode

module.exports = IperGraph

