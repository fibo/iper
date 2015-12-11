describe('getDegree', () => {
  var getDegree = require('iper').getDegree

  var graph1 = require('./examples/graphs/graph1.json')
  var isolatedNode = require('./examples/graphs/isolatedNode.json')
  var loop1 = require('./examples/graphs/loop1.json')

  it('returns number of incident edges', () => {
    var edges = graph1.edges
    getDegree(edges, '1').should.be.eql(1)
    getDegree(edges, '2').should.be.eql(1)
  })

  it('is 0 for isolated nodes', () => {
    var edges = isolatedNode.edges
    getDegree(edges, 'isolated').should.be.eql(0)
  })

  it('counts loops twice', () => {
    var edges = loop1.edges
    getDegree(edges, '0').should.be.eql(2)
  })
})
