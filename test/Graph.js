describe('Graph', () => {
  var Graph = require('iper').Graph

  var nodeData1 = 'foo'
  var nodeData2 = ['bar']

  var graph = new Graph()
  var nodeIds
  var nodeId1
  var nodeId2
  var edgeId1

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
      nodeIds = [nodeId1, nodeId2]
      edgeId1 = graph.addEdge(nodeIds)
      graph.edges[edgeId1].should.be.eql(nodeIds)
    })

    it('returns an id', () => {
      edgeId1.should.be.a.String
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

    it('returns node data', () => {
      graph.delNode(nodeId2).should.be.eql(nodeData2)
    })
  })

  describe('delEdge()', () => {
    it('removes an edge, returns nodeIds', () => {
      nodeId1 = graph.addNode(nodeData1)
      nodeId2 = graph.addNode(nodeData2)
      nodeIds = [nodeId1, nodeId2]
      edgeId1 = graph.addEdge(nodeIds)

      graph.delEdge(edgeId1).should.be.eql(nodeIds)

      var edgeNotDefined = (typeof graph.edges[edgeId1] === 'undefined')
      edgeNotDefined.should.be.true
    })
  })
})
