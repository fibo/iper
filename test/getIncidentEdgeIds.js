import {getIncidentEdgeIds} from 'iper'

import graph1 from './examples/graphs/graph1.json'
import graph2 from './examples/graphs/graph2.json'
import isolatedNode from './examples/graphs/isolatedNode.json'

var edges
var nodeId

describe('getIncidentEdgeIds', () => {
  it('returns an empty array if there is no incident edge', () => {
    //nodeId = 'isolated'
    //edges = isolatedNode.edges
    //getIncidentEdgeIds(edges, nodeId).should.be.eql([])
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
