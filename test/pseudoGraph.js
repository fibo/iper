describe('pseudo Graph', () => {
  const Graph = require('iper').Graph

  const graph = new Graph({ pseudograph: true })

  describe('constructor', () => {
    it('accepts pseudograph flag and adds it to attributes', () => {
      graph.pseudograph.should.be.true
    })

    it('implies multigraph', () => {
      graph.multigraph.should.be.true
    })
  })

  describe('addEdge()', () => {
    it('can create loops', () => {
      const nodeId = graph.addNode()
      const nodeIds = [nodeId, nodeId]

      const edgeId = graph.addEdge(nodeIds)

      graph.edges[edgeId].should.be.eql(nodeIds)
    })
  })
})
