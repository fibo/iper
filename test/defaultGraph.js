describe('default Graph', () => {
  const no = require('not-defined')
  const should = require('should')

  const Graph = require('iper').Graph

  const nodeData1 = 'foo'
  const nodeData2 = ['bar']

  const graph = new Graph()
  var nodeId1
  var nodeId2
  var edgeId1

  describe('constructor', () => {
    it('defaults to an empty generic graph', () => {
      graph.edges.should.deepEqual({})
      graph.nodes.should.deepEqual({})

      should.not.exist(graph.multigraph)
      should.not.exist(graph.pseudograph)
      should.not.exist(graph.uniform)
    })
  })

  describe('addNode()', () => {
    it('creates a node', () => {
      nodeId1 = graph.addNode(nodeData1)
      graph.nodes[nodeId1].should.be.eql(nodeData1)
    })

    it('returns an id', () => {
      nodeId2 = graph.addNode(nodeData2)
      nodeId2.should.be.a.String
    })
  })

  describe('addEdge()', () => {
    it('creates an edge', () => {
      const nodeIds = [nodeId1, nodeId2]

      edgeId1 = graph.addEdge(nodeIds)

      graph.edges[edgeId1].should.be.eql(nodeIds)
    })

    it('requires at least two nodeIds', () => {
      const nodeId = graph.addNode()

      const nodeIds = [nodeId]

      ;(() => {
        graph.addEdge(nodeIds)
      }).should.throw()
    })

    it('cannot create an edge pointing to some nodeId not found', () => {
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
      edgeId1.should.be.a.String
    })

    it('cannot create loops', () => {
      const nodeId = graph.addNode()

      const nodeIds = [nodeId, nodeId]

      ;(() => {
        graph.addEdge(nodeIds)
      }).should.throw()
    })

    it('cannot create duplicated edges', () => {
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
      graph.degreeOf(nodeId1).should.be.eql(1)
    })
  })

  describe('delNode()', () => {
    it('removes a node', () => {
      graph.delNode(nodeId1)

      const nodeNotDefined = no(graph.nodes[nodeId1])
      nodeNotDefined.should.be.true
    })

    it('removes incident edges', () => {
      const incidentEdgeRemoved = no(graph.edges[edgeId1])
      incidentEdgeRemoved.should.be.true
    })
  })

  describe('delEdge()', () => {
    it('removes an edge', () => {
      nodeId1 = graph.addNode(nodeData1)
      nodeId2 = graph.addNode(nodeData2)
      const nodeIds = [nodeId1, nodeId2]
      edgeId1 = graph.addEdge(nodeIds)

      graph.delEdge(edgeId1)

      var edgeNotDefined = (typeof graph.edges[edgeId1] === 'undefined')
      edgeNotDefined.should.be.true
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
