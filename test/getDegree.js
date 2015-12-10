
var should = require('should')

var getDegree = require('..').getDegree

var graph1 = require('./examples/graphs/graph1.json')
  , isolatedNode = require('./examples/graphs/isolatedNode.json')
  , loop1 = require('./examples/graphs/loop1.json')

var getDegree1 = getDegree.bind(graph1)
  , getDegreeOfIsolatedNode = getDegree.bind(graph1)
  , getDegreeOfLoop1 = getDegree.bind(loop1)

describe('getDegree', () => {
  it('returns number of incident edges', () => {
    getDegree1("1").should.be.eql(1)
    getDegree1("2").should.be.eql(1)
  })

  it('is 0 for isolated nodes', () => {
    getDegreeOfIsolatedNode("isolated").should.be.eql(0)
  })

  it('counts loops twice', () => {
    getDegreeOfLoop1("0").should.be.eql(2)
  })
})

