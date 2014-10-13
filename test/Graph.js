
var should = require('should')

var iper = require('..')

var Graph = iper.Graph

var graph = new Graph()
  , nodeIds
  , nodeData1 = 'foo'
  , nodeData2 = ['bar']
  , edgeId1
  , nodeId1
  , nodeId2

describe('Graph', function () {
  describe('addNode()', function () {
    it('creates a node', function () {
      nodeId1 = graph.addNode(nodeData1)
      graph.nodes[nodeId1].should.be.eql(nodeData1)
    })

    it('returns an id', function () {
      nodeId2 = graph.addNode(nodeData2)
      nodeId2.should.be.a.String
    })
  })

  describe('addEdge()', function () {
    it('creates an edge', function () {
      nodeIds = [nodeId1, nodeId2]
      edgeId1 = graph.addEdge(nodeIds)
      graph.edges[edgeId1].should.be.eql(nodeIds)
    })

    it('returns an id', function () {
      edgeId1.should.be.a.String
    })
  })

  describe('delNode()', function () {
    it('removes a node', function () {
      graph.delNode(nodeId1)

      var nodeNotDefined = (typeof graph.nodes[nodeId1] === 'undefined')
      nodeNotDefined.should.be.true
   })

    it('removes incident edges', function () {
      var incidentEdgeRemoved = (typeof graph.edges[edgeId1] === 'undefined')
      incidentEdgeRemoved.should.be.true
    })

    it('returns node data', function () {
      graph.delNode(nodeId2).should.be.eql(nodeData2)
    })
  })

  describe('delEdge()', function () {
    it('removes an edge, returns nodeIds', function () {
      nodeId1 = graph.addNode(nodeData1)
      nodeId2 = graph.addNode(nodeData2)
      nodeIds = [nodeId1, nodeId2]
      edgeId1 = graph.addEdge(nodeIds)

      graph.delEdge(edgeId1).should.be.eql(nodeIds)
      var edgeNotDefined = (typeof graph.edges[edgeId1] === 'undefined')
      edgeNotDefined.should.be.true
    })
  })
})

