
//
// # IperGraph
//

var _        = require('underscore')
  , inherits = require('inherits')

var IperEdge    = require('./IperEdge')
  , IperElement = require('./IperElement')
  , IperNode    = require('./IperNode')

// Constructor

function IperGraph(data, meta) {

  /* TODO in meta ci metto rank e tutte le options che però rimangono fisse */

  IperElement.call(this)

  //
  // ## Attributes
  //

  //
  // ### edges
  //

  var edges = {}

  Object.defineProperty(this, 'edges', {value: edges})

  //
  // ### nodes
  //

  var nodes = {}

  Object.defineProperty(this, 'nodes', {value: nodes})

  //
  // ### data
  //

  function getData () {
    var data = {nodes:{}, edges:{}}

    for (var n in this.nodes) {
      var node = this.nodes[n]
      data.nodes[node.id] = node.data
    }

    for (var e in this.edges) {
      var edge = this.edges[e]
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

inherits(IperGraph, IperNode)

function check(data) {
  /* data.edges has existing nodeIds */
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

//
// ### load()
//

function load(data) {
  var self = this

  /* check if data is valid */
  try {
    check(data)
  }
  catch (er) { throw er }

  /* store a lookup of new <--> old ids */
  var nu = {}

  /* create new nodes first */
  for (var id in data.nodes)
    /* remember association between old and new id */
    nu[id] = self.createNode(data.nodes[id])

  /* create new edges */
  _.each(data.edges, function (oldNodeIds) {
    var newNodeIds = []

    /* loop over old node ids and get the corresponding new ids */
    _.each(oldNodeIds, function (id) {
      newNodeIds.push(nu[id])
    })

    /* use new ids to create a new edge */
    self.createEdge(newNodeIds)
  })
}

IperGraph.prototype.load = load

//
// ### createEdge()
//

function createEdge(nodeIds) {
  var edge = new IperEdge(this, nodeIds)
  return edge.id
}

IperGraph.prototype.createEdge = createEdge

//
// ### createNode()
//

function createNode(data, meta) {
  var node = new IperNode(this, data, meta)
  return node.id
}

IperGraph.prototype.createNode = createNode

//
// ### getEdge()
//

function getEdge(id) {
  var edge = this.edges[id]

  if (_.isUndefined(edge))
    throw new Error()

  return edge
}

IperGraph.prototype.getEdge = getEdge

//
// ### getNode()
//

function getNode(id) {
  var node = this.nodes[id]

  if (_.isUndefined(node))
    throw new Error()

  return node
}

IperGraph.prototype.getNode = getNode

//
// ### removeEdge()
//

function removeEdge(id) {
  delete this.edges[id]
}
IperGraph.prototype.removeEdge = removeEdge

//
// ### removeNode()
//

function removeNode(id) {
  /* loop over all edges */
  _.each(this.edges, function (edge) {

    /* loop over edge nodeIds */
    _.each(edge.nodeIds, function (nodeId, j) {

      /* drop nodeId from edges linked to removed node */
      if (id === nodeId)
        edge.nodeIds.splice(j, 1)
    })

    /* remove orphan edges */
    if (edge.nodeIds.lenght < 2)
      this.removeEdge(edge.id)
  })

  delete this.nodes[id]
}

IperGraph.prototype.removeNode = removeNode

module.exports = IperGraph

