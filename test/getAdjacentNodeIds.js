describe('getAdjacentNodeIds', () => {
  const getAdjacentNodeIds = require('./utils').getAdjacentNodeIds

  const graph1 = require('./examples/graphs/graph1.json')
  const graph2 = require('./examples/graphs/graph2.json')

  it('is mutual', () => {
    const edges = graph1.edges
    const nodeId1 = '1'
    const nodeId2 = '2'

    getAdjacentNodeIds(edges, nodeId1).should.be.eql([nodeId2])
    getAdjacentNodeIds(edges, nodeId2).should.be.eql([nodeId1])
  })

  it('returns an empty array if there is no adjacent node', () => {
    const edges = graph1.edges
    const nodeId = 'not found'

    getAdjacentNodeIds(edges, nodeId).should.be.eql([])
  })

  it('returns adjacent nodes', () => {
    const edges = graph2.edges
    var nodeId

    nodeId = 'a'
    getAdjacentNodeIds(edges, nodeId).should.be.eql(['b', 'c'])

    nodeId = 'b'
    getAdjacentNodeIds(edges, nodeId).should.be.eql(['a', 'c'])
  })
})
