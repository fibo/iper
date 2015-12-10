import {getOrphanEdgeIds} from 'iper'

import graph1 from './examples/graphs/graph1.json'
import orphanEdges1 from './examples/graphs/orphanEdges1.json'
import orphanEdges2 from './examples/graphs/orphanEdges2.json'

describe('getOrphanEdgeIds', () => {
  it('returns orphan edges', () => {
    getOrphanEdgeIds(orphanEdges1.edges, orphanEdges1.nodes).should.be.eql(['0'])

    getOrphanEdgeIds(orphanEdges2.edges, orphanEdges2.nodes).should.be.eql(['3', '6'])
  })

  it('returns an empty array if there is no orphan edge', () => {
    var edges = graph1.edges
    var nodes = graph1.nodes

    getOrphanEdgeIds(edges, nodes).should.be.eql([])
  })
})
