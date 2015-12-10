import {getIncidentEdgeIds} from 'iper'

import graph1 from './examples/graphs/graph1.json'
import graph2 from './examples/graphs/graph2.json'
import isolatedNode from './examples/graphs/isolatedNode.json'

const getIncidentEdgeIds1 = getIncidentEdgeIds.bind(graph1)
const getIncidentEdgeIds2 = getIncidentEdgeIds.bind(graph2)

describe('getIncidentEdgeIds', () => {
  it('returns an empty array if there is no incident edge', () => {
    let nodeId = 'isolated'
    getIncidentEdgeIds.bind(isolatedNode)(nodeId).should.be.eql([])
  })

  it('returns incident edges', () => {
    let nodeId

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
