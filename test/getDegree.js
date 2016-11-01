describe('getDegree', () => {
  const getDegree = require('./utils').getDegree

  const graph1 = require('./examples/graphs/graph1.json')
  const isolatedNode = require('./examples/graphs/isolatedNode.json')
  const loop1 = require('./examples/graphs/loop1.json')

  it('returns number of incident edges', () => {
    const edges = graph1.edges

    getDegree(edges, '1').should.be.eql(1)
    getDegree(edges, '2').should.be.eql(1)
  })

  it('is 0 for isolated nodes', () => {
    const edges = isolatedNode.edges

    getDegree(edges, 'isolated').should.be.eql(0)
  })

  it('counts loops twice', () => {
    const edges = loop1.edges

    getDegree(edges, '0').should.be.eql(2)
  })
})
