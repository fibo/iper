describe('getRank', () => {
  const getRank = require('..').getRank

  const graph1 = require('./examples/graphs/graph1.json')
  const graph2 = require('./examples/graphs/graph2.json')

  it('returns the maximum cardinality of the edges', () => {
    getRank(graph1.edges).should.be.eql(2)
    getRank(graph2.edges).should.be.eql(3)
  })
})
