
iper = require '../index'

IperEdge    = iper.IperEdge
IperElement = iper.IperElement
IperGraph   = iper.IperGraph
IperNode    = iper.IperNode

data = [1, 2, 3]
graph = new IperGraph()

describe 'IperNode', ->
  describe 'inheritance', ->
    it 'is an IperElement', ->
      node = new IperNode()
      node.should.be.instanceOf IperElement

  describe 'constructor', ->
    it 'has signature (graph)', ->
      node = new IperNode(graph)
      node.should.be.instanceOf IperNode

    it 'has signature (graph, data)', ->
      node = new IperNode(graph, data)
      node.should.be.instanceOf IperNode

    it 'has signature (graph, data, meta)', ->
      maxDegree = 2
      meta =
        maxDegree: maxDegree

      node = new IperNode(graph, data, meta)
      node.should.be.instanceOf IperNode

      node.data.should.be.eql data
      node.maxDegree.should.be.eql maxDegree

  describe 'accessors', ->
    describe '#maxDegree', ->
      it 'returns max number of edges allowed', ->
        maxDegree = 4
        meta =
          maxDegree: maxDegree

        node = new IperNode(graph, data, meta)
        node.should.be.instanceOf IperNode

        node.maxDegree.should.be.eql maxDegree

    describe '#degree', ->
      it 'returns number of edges linked', ->
        id1 = graph.createNode()
        id2 = graph.createNode()
        id3 = graph.createNode()

        node1 = graph.getNode(id1)
        node2 = graph.getNode(id2)
        node3 = graph.getNode(id3)

        graph.createEdge([id1, id2])
        node1.degree.should.be.eql 1
        node2.degree.should.be.eql 1
        node3.degree.should.be.eql 0

        graph.createEdge([id2, id3])
        node1.degree.should.be.eql 1
        node2.degree.should.be.eql 2
        node3.degree.should.be.eql 1

        graph.createEdge([id3, id1])
        node1.degree.should.be.eql 2
        node2.degree.should.be.eql 2
        node3.degree.should.be.eql 2

  describe 'methods', ->
    describe '#remove()', ->
      it 'removes the node from its graph', ->
        node = new IperNode(graph)
        nodeId = node.id

        node.remove()

        (() ->
           graph.getEdge(nodeId)
        ).should.throwError()

        node.should.exists

