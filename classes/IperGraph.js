
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

function IperGraph () {

  var args = arguments[0] || {}

  // TODO var isRoot = typeof args.graph === 'undefined'

  var graph = args.graph || this

  IperElement.call(this, graph)


  //
  // ## Attributes
  //

  //
  // ### edges
  //

  Object.defineProperty(this, 'edges', {value: {}})

  //
  // ### nodes
  //

  this.nodes = {}

  //Object.defineProperty(this, 'nodes', {value: nodes})

  //
  // ### subgraphs
  //

  Object.defineProperty(this, 'subgraphs', {value: {}})

  /* TODO
  //
  // ### rank
  //

  Object.defineProperty(this, 'rank', {value: {}})
  */

  /* try to load data passed to constructor */
  try {
    this.load( {
      edges: args.edges,
      nodes: args.nodes,
      subgraphs: args.subgraphs
    })
  }
  catch (err) { throw err }
}

inherits(IperGraph, IperElement)

//
// ## Overridden methods
//

//
// ### valueOf()
//

function valueOf () {
  var val = {
    id: this.id,
    nodes: [],
    edges: [],
    subgraphs: []
  }

  _.each(this.edges, function (edge) {
    val.edges.push(edge.valueOf())
  })

  _.each(this.nodes, function (node) {
    val.nodes.push(node.valueOf())
  })

  _.each(this.subgraphs, function (subgraph) {
    val.subgraphs.push(subgraph.valueOf())
  })

  return val
}

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


//
// Given an object with the following format
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
  var edges    = data.edges    || []
    , nodes    = data.nodes    || []
    , subgraph = data.subgraph || []

  var nodeIds = _.pluck(nodes, 'id')

  // * ids are unique

   /* TODO Da fare anche su edges e subgraph */

  if (_.unique(nodeIds).length !== nodeIds.length)
    throw new Error('duplicated node id')


  // * edges refers to existing nodeIds
  _.each(edges, function (edge) {
    _.each(edge.nodeIds, function (nodeId) {
      if (_.indexOf(nodeIds, nodeId) < 0)
        throw new Error('invalid edge')
    })
  })

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

  var edges = data.edges
    , nodes = data.nodes

  /* store a lookup of new <--> old ids */
  var brandNew = {}

  /* create new nodes first */
  _.each(nodes, function (node) {
    var id = node.id
      , opts = {}

    /* remember association between old and new id */
    brandNew[id] = self.createNode(id, opts)
  })

  /* create new edges */
  _.each(edges, function (edge) {

    var newNodeIds = []
      , oldNodeIds = edge.nodeIds

    /* loop over old node ids and get the corresponding new ids */
    _.each(oldNodeIds, function (id) {
      newNodeIds.push(brandNew[id])
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

  // * returns node id
  return node.id
}

IperGraph.prototype.createNode = createNode

//
// ### createSubgraph()
//

function createSubgraph() {
  var subgraph = new IperGraph({graph: this})

  return subgraph.id
}

IperGraph.prototype.createSubgraph = createSubgraph

//
// ### getEdge()
//

function getEdge(id) {
  var edge = this.edges[id]

  if (_.isUndefined(edge))
    throw new Error('edge not found')

  return edge
}

IperGraph.prototype.getEdge = getEdge

//
// ### getNode()
//

function getNode(id) {
  var node = this.nodes[id]

  if (_.isUndefined(node))
    throw new Error('node not found')

  return node
}

IperGraph.prototype.getNode = getNode

//
// ### removeEdge()
//

function removeEdge(id) {
  var edges = this.edges

  _.each(edges, function (edge) {

    if (id === edge.id)
      delete edges[id]
  })
}

IperGraph.prototype.removeEdge = removeEdge

//
// ### removeNode()
//

function removeNode(id) {
  var edges = this.edges
    , nodes = this.nodes

  /* loop over all edges */
  _.each(edges, function (edge) {

    /* loop over edge nodeIds */
    _.each(edge.nodeIds, function (nodeId, index) {

      /* drop nodeId from edges linked to removed node */
      if (id === nodeId)
        edge.nodeIds.splice(index, 1)
    })

    /* remove orphan edges */
    if (edge.nodeIds.lenght < 2)
      this.removeEdge(edge.id)
  })

  _.each(nodes, function (node) {
    if (id === node.id)
      delete nodes[id]
  })
}

IperGraph.prototype.removeNode = removeNode

module.exports = IperGraph

