
//
// # IperGraph
//

var _        = require('underscore')

var IperEdge    = require('./IperEdge')
  , IperNode    = require('./IperNode')

//
// ## Constructor
//

function IperGraph () {

  var args = arguments[0] || {}

  //
  // ## Attributes
  //

  //
  // ### edges
  //

  Object.defineProperty(this, 'edges', {
    enumerable: true,
    value: []
  })

  //
  // ### nodes
  //

  Object.defineProperty(this, 'nodes', {
    enumerable: true,
    value: []
  })

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
      nodes: args.nodes
    })
  }
  catch (err) { throw err }
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
//   ]
// }
// ```
//
// performs the followings data checks
//

function check(data) {
  var edges    = data.edges    || []
    , nodes    = data.nodes    || []

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
// ### getEdge()
//

function getEdge(id) {
  var edgeFound

  _.each(this.edges, function (edge) {
    if (id === edge.id)
      edgeFound = edge
  })

  if (edgeFound)
    return edgeFound
  else
    throw new Error('edge not found')
}

IperGraph.prototype.getEdge = getEdge

//
// ### getNode()
//

function getNode(id) {
  var nodeFound

  _.each(this.nodes, function (node) {
    if (id === node.id)
      nodeFound = node
  })

  if (nodeFound)
    return nodeFound
  else
    throw new Error('node not found')
}

IperGraph.prototype.getNode = getNode

//
// ### removeEdge()
//

function removeEdge(id) {
  var edges = this.edges

  _.each(edges, function (edge, index) {

    if (id === edge.id)
      edges.splice(index, 1)
  })
}

IperGraph.prototype.removeEdge = removeEdge

//
// ### removeNode()
//
// Removes node by given id
//
//
//```
//graph.removeNode(nodeId)
//```
//

function removeNode(id) {
  var edges = this.edges
    , nodes = this.nodes

    /* TODO fai try getNode per fare throw di node not found */

  /* loop over all edges */
  _.each(edges, function (edge) {

    /* loop over edge nodeIds */
    _.each(edge.nodeIds, function (nodeId, index) {

      /* drop nodeId from edges linked to removed node */
      if (id === nodeId)
        edge.nodeIds.splice(index, 1)
    })

    /* remove orphan edges */
    /* TODO in realta non sarebbe 2 ma il rank dell' edge */
    if (edge.nodeIds.length < 2)
      edge.remove()
  })

  _.each(nodes, function (node, index) {
    if (id === node.id)
      nodes.splice(index, 1)
  })
}

IperGraph.prototype.removeNode = removeNode

module.exports = IperGraph

