describe('getIncidentEdgeIds', () => {
  var getIncidentEdgeIds = require('iper').getIncidentEdgeIds

  var graph1 = require('./examples/graphs/graph1.json')
  var graph2 = require('./examples/graphs/graph2.json')
  var isolatedNode = require('./examples/graphs/isolatedNode.json')

  var edges
  var nodeId

  it('returns an empty array if there is no incident edge', () => {
    nodeId = 'isolated'
    edges = isolatedNode.edges
    getIncidentEdgeIds(edges, nodeId).should.be.eql([])
  })

  it('returns incident edges', () => {
    var result

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
