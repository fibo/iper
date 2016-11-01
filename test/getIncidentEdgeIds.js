describe('getIncidentEdgeIds', () => {
  const getIncidentEdgeIds = require('./utils').getIncidentEdgeIds

  const graph1 = require('./examples/graphs/graph1.json')
  const graph2 = require('./examples/graphs/graph2.json')
  const isolatedNode = require('./examples/graphs/isolatedNode.json')

  it('returns an empty array if there is no incident edge', () => {
    const nodeId = 'isolated'
    const edges = isolatedNode.edges

    getIncidentEdgeIds(edges, nodeId).should.be.eql([])
  })

  it('returns incident edges', () => {
    var result
    var nodeId
    var edges

    nodeId = '1'
    edges = graph1.edges
    result = ['0']
    getIncidentEdgeIds(edges, nodeId).should.be.eql(result)

    nodeId = '2'
    edges = graph1.edges
    result = ['0']
    getIncidentEdgeIds(edges, nodeId).should.be.eql(result)

    nodeId = 'a'
    edges = graph2.edges
    result = ['0', '1', '2']
    getIncidentEdgeIds(edges, nodeId).should.be.eql(result)

    nodeId = 'b'
    edges = graph2.edges
    result = ['0', '1', '2']
    getIncidentEdgeIds(edges, nodeId).should.be.eql(result)

    nodeId = 'c'
    edges = graph2.edges
    result = ['0', '1', '2']
    getIncidentEdgeIds(edges, nodeId).should.be.eql(result)
  })
})
