
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

  this.__defineGetter__('edges', function () { return data.edges })
  this.__defineGetter__('nodes', function () { return data.nodes })

  this.__defineGetter__('data', function () { return {nodes:this.nodes,edges:this.edges} })
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
IperGraph.prototype.check = check

function load(data) {
  try {
    check(data)
  }
  catch (er) { throw er }

  // store a lookup of new <--> old ids
  var nu = {}

  // create new nodes
  for (var i in data.nodes) {
    var node = data.nodes[i]
    nu[node.id] = this.createNode(node.data)
  }

  // create new edges
  for (var i in data.edges) {
    var edge = new data.edges[i]
    var nodeIds = []

    for (var i in edge.nodeIds) {
      nodeId = edge.nodeIds[i]
      nodeIds.push(nu[nodeId])
    }

    this.createEdge(nodeIds)
  }
}
IperGraph.prototype.load = load

function createEdge(nodeIds) {
  return new IperEdge(nodeIds)
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

