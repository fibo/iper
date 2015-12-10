import {getAdjacentNodeIds} from 'iper'

import graph1 from './examples/graphs/graph1.json'
import graph2 from './examples/graphs/graph2.json'

const getAdjacentNodeIds1 = getAdjacentNodeIds.bind(graph1)
const getAdjacentNodeIds2 = getAdjacentNodeIds.bind(graph2)

describe('getAdjacentNodeIds', () => {
  it('is mutual', () => {
    const nodeId1 = '1'
    const nodeId2 = '2'

    getAdjacentNodeIds1(nodeId1).should.be.eql([nodeId2])
    getAdjacentNodeIds1(nodeId2).should.be.eql([nodeId1])
  })

  it('returns an empty array if there is no adjacent node', () => {
    const nodeId = 'not found'
    getAdjacentNodeIds1(nodeId).should.be.eql([])
  })

  it('returns adjacent nodes', () => {
    let nodeId

    nodeId = 'a'
    getAdjacentNodeIds2(nodeId).should.be.eql(['b', 'c'])

    nodeId = 'b'
    getAdjacentNodeIds2(nodeId).should.be.eql(['a', 'c'])
  })
})
