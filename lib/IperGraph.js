
//
// IperGraph
//

var util = require('util')

var IperEdge = require('./IperEdge')
  , IperNode = require('./IperNode')

function check(data) {
  // TODO data.edges has existing nodeIds
  return true
}

function IperGraph(data) {
  IperNode.call(this, data, check)

  this.__defineGetter__('edges', function () { return this.data.edges })
  this.__defineGetter__('nodes', function () { return this.data.nodes })
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

function createNode() {
  return new IperNode(arguments[0])
}
IperGraph.prototype.createNode = createNode

function readNode(id) {
  return this.nodes[id]
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

util.inherits(IperGraph, IperNode)

module.exports = IperGraph

