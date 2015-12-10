
var should = require('should')

var getIncidentEdgeIds = require('..').getIncidentEdgeIds

var graph1 = require('./examples/graphs/graph1.json')
  , graph2 = require('./examples/graphs/graph2.json')
  , isolatedNode = require('./examples/graphs/isolatedNode.json')

var nodeId
  , nodeId1
  , nodeId2

var getIncidentEdgeIds1 = getIncidentEdgeIds.bind(graph1)
  , getIncidentEdgeIds2 = getIncidentEdgeIds.bind(graph2)

describe('getIncidentEdgeIds', () => {
  it('returns an empty array if there is no incident edge', () => {
    nodeId = 'isolated'
    getIncidentEdgeIds.bind(isolatedNode)(nodeId).should.be.eql([])
  })

  it('returns incident edges', () => {
    nodeId = '1'
    getIncidentEdgeIds1(nodeId).should.be.eql(['0'])

    nodeId = '2'
    getIncidentEdgeIds1(nodeId).should.be.eql(['0'])

    nodeId = 'a'
    getIncidentEdgeIds2(nodeId).should.be.eql(['0', '1', '2'])

    nodeId = 'b'
    getIncidentEdgeIds2(nodeId).should.be.eql(['0', '1', '2'])

    nodeId = 'c'
    getIncidentEdgeIds2(nodeId).should.be.eql(['0', '1', '2'])
  })
})

