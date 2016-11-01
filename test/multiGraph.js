describe('multi Graph', () => {
  const should = require('should')

  const Graph = require('iper').Graph

  const graph = new Graph({ multigraph: true })

  describe('constructor', () => {
    it('accepts multigraph flag and adds it to attributes', () => {
      graph.multigraph.should.be.true
    })
  })

  describe('addEdge()', () => {
    it('cannot add duplicated edges', () => {
      const nodeId1 = graph.addNode()
      const nodeId2 = graph.addNode()

      const edgeId1 = graph.addEdge([nodeId1, nodeId2])
      const edgeId2 = graph.addEdge([nodeId1, nodeId2])

      should.deepEqual(graph.edges[edgeId1], graph.edges[edgeId2])
      edgeId1.should.be.not.equal(edgeId2)
    })
  })
})
