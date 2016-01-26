describe('getRank', () => {
  var getRank = require('..').getRank

  var graph1 = require('./examples/graphs/graph1.json')
  var graph2 = require('./examples/graphs/graph2.json')

  it('returns the maximum cardinality of the edges', () => {
    getRank(graph1.edges).should.be.eql(2)
    getRank(graph2.edges).should.be.eql(3)
  })
})
