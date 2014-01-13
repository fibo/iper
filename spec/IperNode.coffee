
iper = require '../index'

IperEdge    = iper.IperEdge
IperElement = iper.IperElement
IperGraph   = iper.IperGraph
IperNode    = iper.IperNode

graph = new IperGraph()

describe 'IperNode', ->
  describe 'Inheritance', ->
    it 'is an IperElement', ->
      node = new IperNode(graph)
      node.should.be.instanceOf IperElement

  describe 'Constructor', ->
    it 'has signature (graph)', ->
      node = new IperNode(graph)
      node.should.be.instanceOf IperNode

    it 'has signature (graph, opts)', ->
      maxDegree = 2
      opts =
        maxDegree: maxDegree

      node = new IperNode(graph, opts)
      node.should.be.instanceOf IperNode

      node.maxDegree.should.be.eql maxDegree

    it 'registers node in graph', ->
      node = new IperNode(graph)
      graph.getNode(node.id).should.be.eql node

  describe 'Attributes', ->
    describe '#maxDegree', ->
      it 'returns max number of edges allowed', ->
        maxDegree = 4
        opts =
          maxDegree: maxDegree

        node = new IperNode(graph, opts)

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

      it 'counts loops', ->
        # Create a double loop
        id1 = graph.createNode()
        graph.createEdge([id1, id1])
        node1 = graph.getNode(id1)
        node1.degree.should.be.eql 2

        # TODO non togliere questo test, ma metti sta cosa nell esempio loops
        # Create a triple loop
        id2 = graph.createNode()
        graph.createEdge([id2, id2, id2])
        node2 = graph.getNode(id2)
        node2.degree.should.be.eql 3

  describe 'Methods', ->
    describe '#getAdjacentNodeIds()', ->
      adjcentNodes = []
      grafo = new IperGraph()

      id1 = grafo.createNode()
      id2 = grafo.createNode()
      id3 = grafo.createNode()
      id4 = grafo.createNode()

      node = grafo.getNode(id1)

      it 'returns an empty array if there is no edge connected', ->
        adjcentNodes = node.getAdjacentNodeIds()
        adjcentNodes.should.be.instanceOf Array
        adjcentNodes.should.be.empty

      it 'does not count loops', ->
        # loop edges does not imply node is adjacent to itself
        grafo.createEdge([id1, id1])
        adjcentNodes = node.getAdjacentNodeIds()
        adjcentNodes.should.be.empty

      it 'returns ids of nodes in hyperedges connected to the node', ->

        grafo.createEdge([id1, id2])
        adjcentNodes = node.getAdjacentNodeIds()
        adjcentNodes.should.be.eql [id2]

        # this edge should not affect adjacentNodeIds
        grafo.createEdge([id2, id3])
        adjcentNodes = node.getAdjacentNodeIds()
        adjcentNodes.should.be.eql [id2]

        # adjacentNodeIds are uniq
        grafo.createEdge([id1, id2])
        adjcentNodes = node.getAdjacentNodeIds()
        adjcentNodes.should.be.eql [id2]

        grafo.createEdge([id1, id2, id3])
        adjcentNodes = node.getAdjacentNodeIds()
        adjcentNodes.should.be.eql [id2, id3]

        grafo.createEdge([id1, id4])
        adjcentNodes = node.getAdjacentNodeIds()
        adjcentNodes.should.be.eql [id2, id3, id4]

      it 'works when a node is removed' # , ->
        # # remove a node
        # grafo.removeNode(id2)
        # adjcentNodes = node.getAdjacentNodeIds()
        # adjcentNodes.should.be.eql [id3, id4]

