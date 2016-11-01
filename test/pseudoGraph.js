describe('pseudo Graph', () => {
  const Graph = require('..').Graph

  const graph = new Graph({ pseudograph: true })

  describe('constructor', () => {
    it('accepts pseudograph flag and adds it to attributes', () => {
      graph.pseudograph.should.be.true
    })
  })

  describe('addEdge()', () => {
    it('cannot create loops', () => {
      const nodeId = graph.addNode()

      ;(() => {
        graph.addEdge([nodeId, nodeId])
      }).should.throw()
    })
  })
})
