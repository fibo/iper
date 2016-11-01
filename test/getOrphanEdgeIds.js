describe('getOrphanEdgeIds', () => {
  const getOrphanEdgeIds = require('./utils').getOrphanEdgeIds

  const graph1 = require('./examples/graphs/graph1.json')
  const orphanEdges1 = require('./examples/graphs/orphanEdges1.json')
  const orphanEdges2 = require('./examples/graphs/orphanEdges2.json')

  it('returns orphan edges', () => {
    getOrphanEdgeIds(orphanEdges1.edges, orphanEdges1.nodes).should.be.eql(['0'])

    getOrphanEdgeIds(orphanEdges2.edges, orphanEdges2.nodes).should.be.eql(['3', '6'])
  })

  it('returns an empty array if there is no orphan edge', () => {
    const edges = graph1.edges
    const nodes = graph1.nodes

    getOrphanEdgeIds(edges, nodes).should.be.eql([])
  })
})
