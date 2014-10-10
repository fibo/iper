
var should = require('should')

var getAdjacentNodeIds = require('../src/getAdjacentNodeIds')

var graph1 = require('./examples/graphs/graph1.json')

describe('getAdjacentNodeIds', function () {
  it('returns an empty array if there is no adjacent node', function () {
    getAdjacentNodeIds(graph1, 1).should.be.eql([])
  })
})

