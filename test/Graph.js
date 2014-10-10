
var should = require('should')

var iper = require('..')

var Graph = iper.Graph

var graph = new Graph()

describe('Graph', function () {
  it('is a constructor', function () {
    graph.should.be.instanceOf(Graph)
  })

  it('sets defaults', function () {
    graph.nodes.should.be.eql({})
    graph.edges.should.be.eql({})
  })
})

