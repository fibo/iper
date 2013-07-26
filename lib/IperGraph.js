
var nextId = 1

function IperGraph() {
  var edges = {} 
    , nodes = {}

  this.__defineGetter__('edges', function () { return edges })
  this.__defineGetter__('nodes', function () { return nodes })
}

function createEdge() {
}
IperGraph.prototype.createEdge = createEdge

function readEdge(id) {
}
IperGraph.prototype.readEdge = readEdge

function updateEdge(id, nodeData) {
}
IperGraph.prototype.updateEdge = updateEdge

function deleteEdge(id) {
}
IperGraph.prototype.deleteEdge = deleteEdge

function createNode() {
  nextId++
  nodeData = arguments[0]
  nodes[nextId] = nodeData
  return nextId
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

module.exports = IperGraph

