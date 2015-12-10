import {getAdjacentNodeIds} from 'iper'

import graph1 from './examples/graphs/graph1.json'
import graph2 from './examples/graphs/graph2.json'

describe('getAdjacentNodeIds', () => {
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
    let nodeId

    nodeId = 'a'
    getAdjacentNodeIds(edges, nodeId).should.be.eql(['b', 'c'])

    nodeId = 'b'
    getAdjacentNodeIds(edges, nodeId).should.be.eql(['a', 'c'])
  })
})
