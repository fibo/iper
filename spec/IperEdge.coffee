
iper   = require '../index'
should = require('should')

IperEdge    = iper.IperEdge
IperElement = iper.IperElement
IperGraph   = iper.IperGraph
IperNode    = iper.IperNode

graph = new IperGraph()
id1 = graph.createNode(1)
id2 = graph.createNode(2)
id3 = graph.createNode(3)
nodeIds = [id1, id2, id3]

describe 'IperEdge', ->
  describe 'inheritance', ->
    it 'is an IperElement', ->
      edge = new IperEdge(graph, nodeIds)
      edge.should.be.instanceOf IperElement

  describe 'constructor', ->
    it 'has signature (graph, nodeIds)', ->
      edge = new IperEdge(graph, nodeIds)
      edge.should.be.instanceOf IperEdge

    it 'checks #nodeIds is an array of valid node ids', ->
      (() ->
          edge = new IperEdge(graph, [-1, -2])
      ).should.throwError()

  describe 'accessors', ->
    describe '#id', ->
      it 'returns the edge #id', ->
        edge = new IperEdge(graph, nodeIds)
        edge.id.should.be.a.number 

    describe '#nodeIds', ->
      it 'returns the #nodeIds', ->
        edge = new IperEdge(graph, nodeIds)
        edge.nodeIds.should.eql nodeIds 

  describe 'methods', ->
    describe '#remove()', ->
      it 'removes the edge from its graph', ->
        edge = new IperEdge(graph, nodeIds)
        edgeId = edge.id

        edge.remove()
        should.not.exist graph.getEdge(edgeId)

