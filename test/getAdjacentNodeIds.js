
var should = require('should')

var getAdjacentNodeIds = require('..').getAdjacentNodeIds

var graph1 = require('./examples/graphs/graph1.json')
  , graph2 = require('./examples/graphs/graph2.json')

var nodeId
  , nodeId1
  , nodeId2

var getAdjacentNodeIds1 = getAdjacentNodeIds.bind(graph1)
  , getAdjacentNodeIds2 = getAdjacentNodeIds.bind(graph2)

describe('getAdjacentNodeIds', function () {
  it('is mutual', function () {
    nodeId1 = "1"
    nodeId2 = "2"

    getAdjacentNodeIds1(nodeId1).should.be.eql([nodeId2])
    getAdjacentNodeIds1(nodeId2).should.be.eql([nodeId1])
  })

  it('returns an empty array if there is no adjacent node', function () {
    nodeId = "not found"
    getAdjacentNodeIds1(nodeId).should.be.eql([])
  })

  it('returns adjacent nodes', function () {
    nodeId = "a"
    getAdjacentNodeIds2(nodeId).should.be.eql(["b", "c"])

    nodeId = "b"
    getAdjacentNodeIds2(nodeId).should.be.eql(["a", "c"])
  })
})

