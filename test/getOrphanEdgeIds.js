import {getOrphanEdgeIds} from 'iper'

import graph1 from './examples/graphs/graph1.json'
import orphanEdges1 from './examples/graphs/orphanEdges1.json'
import orphanEdges2 from './examples/graphs/orphanEdges2.json'

describe('getOrphanEdgeIds', () => {
  it('returns orphan edges', () => {
    getOrphanEdgeIds.bind(orphanEdges1)().should.be.eql(['0'])

    getOrphanEdgeIds.bind(orphanEdges2)().should.be.eql(['3', '6'])
  })

  it('returns an empty array if there is no orphan edge', () => {
    getOrphanEdgeIds.bind(graph1)().should.be.eql([])
  })
})
