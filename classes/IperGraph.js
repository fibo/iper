
//
// # IperGraph
//

var _        = require('underscore')
  , inherits = require('inherits')

var IperEdge    = require('./IperEdge')
  , IperElement = require('./IperElement')
  , IperNode    = require('./IperNode')

//
// Constructor
//

function IperGraph() {

  var args = arguments[0] || {}

  var graph = args.graph || this

  IperElement.call(this, graph)


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
  // ### subgraphs
  //

  var subgraphs = {}

  Object.defineProperty(this, 'subgraphs', {value: subgraphs})

  /* try to load data passed to constructor */
  try {
    load( {
      edges: args.edges,
      nodes: args.nodes,
      subgraphs: args.subgraphs
    })
  }
  catch (ignore) {}
}

inherits(IperGraph, IperElement)

//
// ## Methods
//

//
// ### check(data)
//
// **TODO**: vedi se riesco a referenziare la funzione load qui sotto nella documentazione
// This method is used by load to check data is valid
// ma può essere usata anche esternamente come metodo statico
// dovrebbe essere statico ma ereditabile
//


// Given an objec with the following format
//
// ```
// {
//   nodes: [
//     {
//       id: 1
//     },
//     {
//       id: 2
//     }
//     ...
//   ],
//   edges: [
//     {
//       id: 3,
//       nodeIds: [1, 2]
//     }
//     ...
//   ],
//   subgraphs: [
//
//   ],
// }
// ```
//
// performs the followings data checks
//

function check(data) {
  var edges    = data.edges
    , nodes    = data.nodes
    , subgraph = data.subgraph

  // * ids are unique
  /* TODO usa qualche funzione di underscore, e fai il test
   * dovrei mettere tutti gli id in un array poi usare
   *
   * var ids = []
   *
   * if (_.unique(ids).length !== ids.length)
   *   throw new Error()
   * */


  // * edges refers to existing nodeIds
  for (var edgeId in edges) {
    var edgeData = edges[edgeId]

    for (var i in edgeData) {
      var nodeId = edgeData[i]

      if (_.indexOf(nodes, nodeId) < 0)
        throw new Error()
    }
  }

  return true
}

IperGraph.prototype.check = check

//
// ### load(data) {#load}
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

function createNode(opts) {
  var node = new IperNode(this, opts)

  return node.id
}

IperGraph.prototype.createNode = createNode

//
// ### createSubgraph()
//

function createSubGraph() {
  var subgraph = new IperGraph({graph: this})
  return subgraph.id
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
    throw new Error('node is not defined')

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

