describe('default Graph', () => {
  const no = require('not-defined')
  const should = require('should')
  const Graph = require('iper').Graph

  describe('constructor', () => {
    it('defaults to an empty generic graph', () => {
      const graph = new Graph()

      graph.edges.should.deepEqual({})
      graph.nodes.should.deepEqual({})

      should.not.exist(graph.multigraph)
      should.not.exist(graph.pseudograph)
      should.not.exist(graph.uniform)
    })
  })

  describe('addNode()', () => {
    it('creates a node', () => {
      const graph = new Graph()
      const nodeData = 'foo'

      const nodeId = graph.addNode(nodeData)

      graph.nodes[nodeId].should.be.eql(nodeData)
    })

    it('returns an id', () => {
      const graph = new Graph()

      const nodeId = graph.addNode()

      nodeId.should.be.a.String()
    })
  })

  describe('addEdge()', () => {
    it('creates an edge', () => {
      const graph = new Graph()

      const nodeId1 = graph.addNode()
      const nodeId2 = graph.addNode()
      const nodeIds = [nodeId1, nodeId2]

      const edgeId = graph.addEdge(nodeIds)

      graph.edges[edgeId].should.be.eql(nodeIds)
    })

    it('requires at least two nodeIds', () => {
      const graph = new Graph()

      const nodeId = graph.addNode()

      const nodeIds = [nodeId]

      ;(() => {
        graph.addEdge(nodeIds)
      }).should.throw()
    })

    it('cannot create an edge pointing to some nodeId not found', () => {
      const graph = new Graph()

      const nodeId1 = graph.addNode()
      const nodeId2 = graph.addNode()

      const nodeIds = [nodeId1, 'nodeIdNotFound', nodeId2]

      ;(() => {
        graph.addEdge(nodeIds)
      }).should.throw()
    })

    it('can create edges with cardinality greater than 2', () => {
      const graph = new Graph()

      const nodeId1 = graph.addNode()
      const nodeId2 = graph.addNode()
      const nodeId3 = graph.addNode()

      const nodeIds = [nodeId1, nodeId2, nodeId3]

      const edgeId1 = graph.addEdge(nodeIds)

      graph.edges[edgeId1].should.be.eql(nodeIds)
    })

    it('returns an id', () => {
      const graph = new Graph()

      const nodeId1 = graph.addNode()
      const nodeId2 = graph.addNode()

      const nodeIds = [nodeId1, nodeId2]

      const edgeId = graph.addEdge(nodeIds)

      edgeId.should.be.a.String()
    })

    it('cannot create loops', () => {
      const graph = new Graph()

      const nodeId = graph.addNode()

      const nodeIds = [nodeId, nodeId]

      ;(() => {
        graph.addEdge(nodeIds)
      }).should.throw()
    })

    it('cannot create duplicated edges', () => {
      const graph = new Graph()

      const nodeId1 = graph.addNode()
      const nodeId2 = graph.addNode()

      graph.addEdge([nodeId1, nodeId2])

      ;(() => {
        graph.addEdge([nodeId1, nodeId2])
      }).should.throw()
    })
  })

  describe('degreeOf(nodeId)', () => {
    it('returns the degree of a node', () => {
      const graph = new Graph()

      const nodeId1 = graph.addNode()
      const nodeId2 = graph.addNode()
      const nodeIds = [nodeId1, nodeId2]

      graph.addEdge(nodeIds)

      graph.degreeOf(nodeId1).should.be.eql(1)
    })
  })

  describe('delNode()', () => {
    it('removes a node', () => {
      const graph = new Graph()
      const nodeData = 'foo'

      const nodeId = graph.addNode(nodeData)

      graph.nodes[nodeId].should.be.eql(nodeData)

      graph.delNode(nodeId)

      const nodeNotDefined = no(graph.nodes[nodeId])

      nodeNotDefined.should.be.true()
    })

    it('removes incident edges', () => {
      const graph = new Graph()

      const nodeId1 = graph.addNode()
      const nodeId2 = graph.addNode()
      const nodeId3 = graph.addNode()
      const nodeId4 = graph.addNode()

      const nodeIds12 = [nodeId1, nodeId2]
      const nodeIds23 = [nodeId2, nodeId3]
      const nodeIds1234 = [nodeId1, nodeId2, nodeId3, nodeId4]

      const edgeId1 = graph.addEdge(nodeIds12)
      const edgeId2 = graph.addEdge(nodeIds23)
      const edgeId3 = graph.addEdge(nodeIds1234)

      graph.edges[edgeId1].should.be.eql(nodeIds12)
      graph.edges[edgeId2].should.be.eql(nodeIds23)
      graph.edges[edgeId2].should.be.eql(nodeIds23)

      graph.delNode(nodeId1)

      const incidentEdgeRemoved1 = no(graph.edges[edgeId1])
      incidentEdgeRemoved1.should.be.true()

      graph.edges[edgeId2].should.be.Array()
      graph.edges[edgeId3].should.be.Array()

      graph.delNode(nodeId2)

      const incidentEdgeRemoved2 = no(graph.edges[edgeId2])
      incidentEdgeRemoved2.should.be.true()

      graph.edges[edgeId3].should.be.Array()

      graph.delNode(nodeId4)

      const incidentEdgeRemoved3 = no(graph.edges[edgeId3])
      incidentEdgeRemoved3.should.be.true()
    })
  })

  describe('delEdge()', () => {
    it('removes an edge', () => {
      const graph = new Graph()
      const nodeId1 = graph.addNode()
      const nodeId2 = graph.addNode()
      const nodeIds = [nodeId1, nodeId2]

      const edgeId = graph.addEdge(nodeIds)

      graph.delEdge(edgeId)

      const edgeNotDefined = no(graph.edges[edgeId])
      edgeNotDefined.should.be.true()
    })
  })

  describe('getRank()', () => {
    it('returns the max cardinality of any edge', () => {
      const graph = new Graph()

      const nodeId1 = graph.addNode()
      const nodeId2 = graph.addNode()
      const nodeId3 = graph.addNode()
      const nodeId4 = graph.addNode()

      graph.addEdge([nodeId1, nodeId2])
      graph.addEdge([nodeId3, nodeId2])
      graph.addEdge([nodeId1, nodeId4])

      graph.getRank().should.be.eql(2)

      graph.addEdge([nodeId1, nodeId2, nodeId3])

      graph.getRank().should.be.eql(3)

      graph.addEdge([nodeId4, nodeId1, nodeId2, nodeId3])

      graph.getRank().should.be.eql(4)
    })
  })
})
