describe('getAdjacentNodeIds', () => {
  var getAdjacentNodeIds = require('..').getAdjacentNodeIds

  var graph1 = require('./examples/graphs/graph1.json')
  var graph2 = require('./examples/graphs/graph2.json')

  it('is mutual', () => {
    var edges = graph1.edges
    var nodeId1 = '1'
    var nodeId2 = '2'

    getAdjacentNodeIds(edges, nodeId1).should.be.eql([nodeId2])
    getAdjacentNodeIds(edges, nodeId2).should.be.eql([nodeId1])
  })

  it('returns an empty array if there is no adjacent node', () => {
    var edges = graph1.edges
    var nodeId = 'not found'

    getAdjacentNodeIds(edges, nodeId).should.be.eql([])
  })

  it('returns adjacent nodes', () => {
    var edges = graph2.edges
    var nodeId

    nodeId = 'a'
    getAdjacentNodeIds(edges, nodeId).should.be.eql(['b', 'c'])

    nodeId = 'b'
    getAdjacentNodeIds(edges, nodeId).should.be.eql(['a', 'c'])
  })
})
