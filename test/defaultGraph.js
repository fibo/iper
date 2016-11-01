describe('default Graph', () => {
  const Graph = require('..').Graph
  const defaultGraph = require('../src/defaultGraph')

  const nodeData1 = 'foo'
  const nodeData2 = ['bar']

  const graph = new Graph()
  var nodeId1
  var nodeId2
  var edgeId1

  describe('constructor', () => {
    it('defaults to defaultGraph', () => {
      graph.edges.should.deepEqual(defaultGraph.edges)
      graph.nodes.should.deepEqual(defaultGraph.nodes)
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

    it('returns an id', () => {
      edgeId1.should.be.a.String
    })

    it('can create loops', () => {
      const nodeId = graph.addNode()
      const nodeIds = [nodeId, nodeId]

      const edgeId = graph.addEdge(nodeIds)

      graph.edges[edgeId].should.be.eql(nodeIds)
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

      var nodeNotDefined = (typeof graph.nodes[nodeId1] === 'undefined')
      nodeNotDefined.should.be.true
    })

    it('removes incident edges', () => {
      var incidentEdgeRemoved = (typeof graph.edges[edgeId1] === 'undefined')
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
})
