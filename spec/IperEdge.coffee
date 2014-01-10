
iper   = require '../index'
should = require('should')

IperEdge    = iper.IperEdge
IperElement = iper.IperElement
IperGraph   = iper.IperGraph
IperNode    = iper.IperNode

graph = new IperGraph()
id1 = graph.createNode()
id2 = graph.createNode()
id3 = graph.createNode()
nodeIds = [id1, id2, id3]

describe 'IperEdge', ->
  describe 'Inheritance', ->
    it 'is an IperElement', ->
      edge = new IperEdge(graph, nodeIds)
      edge.should.be.instanceOf IperElement

  describe 'Constructor', ->
    it 'has signature (graph, nodeIds)', ->
      edge = new IperEdge(graph, nodeIds)
      edge.should.be.instanceOf IperEdge

    it 'requires graph is defined and nodeIds is an array', ->
      ( () ->
          edge = new IperEdge()
      ).should.throwError()

      ( () ->
          edge = new IperEdge(graph)
      ).should.throwError()

    it 'checks #nodeIds is an array of valid node ids', ->
      (() ->
          edge = new IperEdge(graph, [-1, -2])
      ).should.throwError()

    it 'checks node *degree* does not excede its #maxDegree' , ->
      opts =
        maxDegree: 2

      id = graph.createNode(opts)

      edge = new IperEdge(graph, [id1, id])
      edge = new IperEdge(graph, [id2, id])

      ( () ->
          edge = new IperEdge(graph, [id2, id])
      ).should.throwError()

    it 'registers edge in graph', ->
      edge = new IperEdge(graph, [id1, id2])
      graph.getEdge(edge.id).should.be.eql edge

  describe 'Attributes', ->
    describe '#nodeIds', ->
      it 'returns the #nodeIds', ->
        edge = new IperEdge(graph, nodeIds)
        edge.nodeIds.should.eql nodeIds 

  describe 'Methods', ->
    describe '#remove()', ->
      it 'removes the edge from its graph', ->
        edge = new IperEdge(graph, nodeIds)
        edgeId = edge.id

        edge.remove()

        (() ->
           graph.getEdge(edgeId)
        ).should.throwError()

        edge.should.exists

