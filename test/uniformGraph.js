describe('uniform Graph', () => {
  const Graph = require('iper').Graph
  const k = 2

  const graph = new Graph({ uniform: k })

  describe('constructor', () => {
    it('accepts uniform arg and adds it to attributes', () => {
      graph.uniform.should.be.eql(k)
    })

    it('requires uniform to be an integer equal or grater than 2', () => {
      ;(() => {
        Graph({ uniform: 7.5 })
      }).should.throw()

      ;(() => {
        Graph({ uniform: -2 })
      }).should.throw()

      ;(() => {
        Graph({ uniform: 1 })
      }).should.throw()
    })

    it('checks that edges are uniform', () => {
      ;(() => {
        Graph({
          uniform: 2,
          nodes: { a: 1, b: 2, c: 3 },
          edges: { e: [ 'a', 'b', 'c' ] }
        })
      }).should.throw()
    })
  })

  describe('addEdge()', () => {
    it('cannot create edges with cardinality other than k', () => {
      const nodeId1 = graph.addNode()
      const nodeId2 = graph.addNode()
      const nodeId3 = graph.addNode()

      const nodeIds = [nodeId1, nodeId2, nodeId3]

      ;(() => {
        graph.addEdge(nodeIds)
      }).should.throw()
    })
  })

  describe('getRank()', () => {
    it('returns the value of uniform, even if the graph is still empty', () => {
      const rank = 10

      const graph = new Graph({ uniform: rank })

      rank.should.be.equal(graph.getRank())
    })
  })
})
