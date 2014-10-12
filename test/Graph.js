
var should = require('should')

var iper = require('..')

var Graph = iper.Graph

var graph = new Graph()
  , nodeIds
  , nodeData
  , edgeId
  , nodeId1
  , nodeId2

describe('Graph', function () {
  describe('addNode()', function () {
    it('creates a node', function () {
      nodeData = 'foo'
      nodeId1 = graph.addNode(nodeData)
      graph.nodes[nodeId1].should.be.eql(nodeData)
    })

    it('returns an id', function () {
      nodeData = 'bar'
      nodeId2 = graph.addNode(nodeData)
      nodeId2.should.be.a.String
    })
  })

  describe('addEdge()', function () {
    it('creates an edge', function () {
      nodeIds = [nodeId1, nodeId2]
      edgeId = graph.addEdge(nodeIds)
      graph.edges[edgeId].should.be.eql(nodeIds)
    })

    it('returns an id', function () {
      edgeId.should.be.a.String
    })
  })

  describe('delNode()', function () {
    it('removes a node', function () {
      graph.delNode(nodeId1)
    })

    it('removes incident edges'/*, function () {
    }*/)
  })
})

