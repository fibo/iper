
//
// IperGraph
//

var util = require('util')

var IperEdge    = require('./IperEdge')
  , IperElement = require('./IperElement')
  , IperNode    = require('./IperNode')

function IperGraph(data) {

  IperElement.call(this)

  this.edges = {}
  this.nodes = {}

  this.__defineGetter__('data',
    function () {
      var data = {nodes:{}, edges:{}}

      for (var i in this.nodes) {
        var node = this.nodes[i]
        data.nodes[node.id] = node.data
      }

      for (var i in this.edges) {
        var edge = this.edges[i]
        data.edges[edge.id] = edge.nodeIds
      }

      return data
    }
  )

  // 
  try {
    load(data)
  }
  catch (ignore) {}
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
  return true
}
IperGraph.prototype.check = check

function load(data) {
  // check if data is valid
  try {
    check(data)
  }
  catch (er) { throw er }

  // store a lookup of new <--> old ids
  var nu = {}

  // create new nodes
  for (var id in data.nodes) {
    nu[id] = this.createNode(data.nodes[id])
  }

  // create new edges
  for (var id in data.edges) {
    var nodeIds = []
    var oldNodeIds = data.edges[id]

    for (var i in oldNodeIds) {
      nodeId = oldNodeIds[i]
      nodeIds.push(nu[nodeId])
    }

    this.createEdge(nodeIds)
  }
}
IperGraph.prototype.load = load

function createEdge(nodeIds) {
  var edge = new IperEdge(this, nodeIds)
  this.edges[edge.id] = edge
  return edge.id;
}
IperGraph.prototype.createEdge = createEdge

function getEdge(id) {
  return this.edges[id]
}
IperGraph.prototype.getEdge = getEdge

function removeEdge(id) {
  delete this.edges[id]
}
IperGraph.prototype.removeEdge = removeEdge

function removeNode(id) {
  delete this.nodes[id]
}
IperGraph.prototype.removeNode = removeNode

function createNode(data) {
  var node = new IperNode(this, data)
  this.nodes[node.id] = node
  return node.id
}
IperGraph.prototype.createNode = createNode

function getNode(id) {
  return this.nodes[id]
}
IperGraph.prototype.getNode = getNode

function updateNode(id, nodeData) {
  this.nodes[id] = nodeData
}
IperGraph.prototype.updateNode = updateNode

function deleteNode(id) {
  delete this.nodes[id]
}
IperGraph.prototype.deleteNode = deleteNode

module.exports = IperGraph

