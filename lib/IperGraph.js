
//
// IperGraph
// =========
//

var _    = require('underscore')
  , util = require('util')

var IperEdge    = require('./IperEdge')
  , IperElement = require('./IperElement')
  , IperNode    = require('./IperNode')

// Constructor

function IperGraph(data) {

  IperElement.call(this)

  this.edges = {}
  this.nodes = {}

  // data
  function getData() {
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

  Object.defineProperty(this, 'data', {get: getData})

  // try to load data passed to constructor
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
  var self = this

  // check if data is valid
  try {
    check(data)
  }
  catch (er) { throw er }

  // store a lookup of new <--> old ids
  var nu = {}

  // create new nodes first
  for (var id in data.nodes)
    // remember association between old and new id
    nu[id] = self.createNode(data.nodes[id])

  // create new edges
  _.each(data.edges, function (oldNodeIds) {
    var newNodeIds = []

    // loop over old node ids and get the corresponding new ids
    _.each(oldNodeIds, function (id) {
      newNodeIds.push(nu[id])
    })

    // use new ids to create a new edge
    self.createEdge(newNodeIds)
  })
}
IperGraph.prototype.load = load

function createEdge(nodeIds) {
  var edge = new IperEdge(this, nodeIds)
  this.edges[edge.id] = edge
  return edge.id
}
IperGraph.prototype.createEdge = createEdge

function pushEdge(edge) {
  this.edges[edge.id] = edge
}

IperGraph.prototype.pushEdge = pushEdge

function getEdge(id) {
  var edge = this.edges[id]

  if (_.isUndefined(edge))
    throw new Error()

  return edge
}
IperGraph.prototype.getEdge = getEdge

function removeEdge(id) {
  delete this.edges[id]
}
IperGraph.prototype.removeEdge = removeEdge

function removeNode(id) {
  // loop over all edges
  _.each(this.edges, function (edge) {

    // loop over edge nodeIds
    _.each(edge.nodeIds, function (nodeId, j) {

      // remove nodeId from edges linked to removed node
      if (id === nodeId) edge.nodeIds.splice(j, 1)
    })

    // remove orphan edges
    if (edge.nodeIds.lenght < 2) edge.remove()
  })

  delete this.nodes[id]
}
IperGraph.prototype.removeNode = removeNode

function createNode(data, meta) {
  var node = new IperNode(this, data, meta)
  return node.id
}
IperGraph.prototype.createNode = createNode

function pushNode(node) {
  this.nodes[node.id] = node
}
IperGraph.prototype.pushNode = pushNode

function getNode(id) {
  var node = this.nodes[id]

  if (_.isUndefined(node))
    throw new Error()

  return node
}
IperGraph.prototype.getNode = getNode

module.exports = IperGraph

