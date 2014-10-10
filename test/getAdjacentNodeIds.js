
var should = require('should')

var getAdjacentNodeIds = require('../src/getAdjacentNodeIds')

var graph1 = require('./examples/graphs/graph1.json')

var nodeId
  , nodeId1
  , nodeId2

var getAdjacentNodeIds1 = getAdjacentNodeIds.bind(graph1)

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
})
