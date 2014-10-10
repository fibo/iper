
var should = require('should')

var getRank = require('..').getRank

var graph1 = require('./examples/graphs/graph1.json')
  , graph2 = require('./examples/graphs/graph2.json')

var getRank1 = getRank.bind(graph1)
  , getRank2 = getRank.bind(graph2)

describe('getRank', function () {
  it('returns the maximum cardinality of the edges', function () {
    getRank1().should.be.eql(2)
    getRank2().should.be.eql(3)
  })
})

