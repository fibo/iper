
iper   = require '../index'
should = require 'should'

IperEdge    = iper.IperEdge
IperElement = iper.IperElement
IperGraph   = iper.IperGraph
IperNode    = iper.IperNode

describe 'IperGraph', ->
  describe 'Inheritance', ->
    it 'is an IperElement', ->
      graph = new IperGraph()
      graph.should.be.instanceOf IperElement

  describe 'Constructor', ->
    it 'has signature ()', ->
      graph = new IperGraph()
      graph.should.be.instanceOf IperGraph

    it 'has signature ({nodes, edges})', ->
      # This is a simple directed graph
      # 1 -> 2
      args =
        nodes: [1, 2]
        edges:
          3: [1, 2]

      graph = new IperGraph(args)
      graph.should.be.instanceOf IperGraph

    it 'has signature ({nodes})', ->
      # This is a graph without nodes
      args =
        nodes: [1, 2, 3, 4]

      graph = new IperGraph(args)
      graph.should.be.instanceOf IperGraph

    it 'has signature ({rank})'

  describe 'Attributes', ->
    describe '#rank', ->
      it 'returns graph rank'

  describe 'Methods', ->
    graph = new IperGraph()

    describe '#createNode()', ->
      it 'returns nodeId', ->
        id = graph.createNode
        id.should.be.defined

    describe '#createSubgraph()', ->
      it 'returns subgraphId'

    describe '#getNode()', ->
      it 'has signature (id), returns node', ->
        id = graph.createNode
      #  node = graph.getNode id
      #  node.should.be.instanceOf IperNode
      #  node.id.should.be.eql id

      it 'throws error if nodeId does not exists', ->
        (() ->
          graph.getNode(-1)
        ).should.throwError()

    describe '#check(data)', ->
      it 'checks data is valid', ->
        # invalid edge
        data =
          nodes: [1, 2]
          edges:
            3: [5, 6]

        (() ->
          graph.check(data)
        ).should.throwError()

      it 'returns true on success', ->
        graph = new IperGraph()

        # This is a simple hypergraph
        # 1 -> 2 -> 3
        data =
          nodes: [1, 2, 3]
          edges:
            4: [1, 2, 3]

        graph.check(data).should.be.true

    describe '#load(data)', ->
      it 'loads data', ->
        # graph = new IperGraph()

        # # This is a loop graph
        # # foo -> foo
        # data =
        #   nodes:
        #     1: 'foo'
        #   edges:
        #     2: [1, 1]

        # graph.load(data)

        # # Since ids will change I can't use
        # # graph.data.should.be.eql data

        # graph.check(graph.data).should.be.true

      it 'checks data is valid', ->
        # edges without nodes does not make sense
        data =
          edges:
            1: [5, 6]
            2: [3, 4]

        (() ->
          graph.load(data)
        ).should.throwError()

      it 'removes edges left without nodes' # , ->

      # nodeId1 = graph.createNode(1)
      # nodeId2 = graph.createNode(2)
      # nodeIds = [nodeId1, nodeId2]

      # edgeId = graph.createEdge nodeIds

      # graph.removeNode(nodeId1)

      # (() ->
      #   graph.getEdge(edgeId)
      # ).should.throwError()

    describe '#getEdge()', ->
      it 'has signature (id), returns edge', ->
        nodeId1 = graph.createNode(1)
        nodeId2 = graph.createNode(2)
        nodeIds = [nodeId1, nodeId2]

        id = graph.createEdge nodeIds
        edge = graph.getEdge id
        edge.should.be.instanceOf IperEdge
        edge.id.should.be.eql id

      it 'throws error if edge does not exists', ->
        (() ->
          graph.getEdge(-1)
        ).should.throwError()

    describe '#createEdge()', ->
      it 'has signature ([id1, id2, ...]), returns edge', ->
        nodeId1 = graph.createNode(1)
        nodeId2 = graph.createNode(2)
        nodeIds = [nodeId1, nodeId2]

        id = graph.createEdge nodeIds
        edge = graph.getEdge id
        edge.should.be.instanceOf IperEdge
        edge.id.should.be.eql id

    describe '#removeEdge()', ->
      it 'has signature (id), removes edge from its graph', ->
        graph = new IperGraph()

        nodeId1 = graph.createNode()
        nodeId2 = graph.createNode()

        edgeId = graph.createEdge([nodeId1, nodeId2])

        graph.removeEdge(edgeId)

        (() ->
          graph.getEdge(edgeId)
        ).should.throwError()

    describe '#removeNode()', ->
      it 'has signature (id), removes node from its graph', ->
        graph = new IperGraph()

        nodeId = graph.createNode()

        graph.removeNode(nodeId)

        (() ->
          graph.getNode(nodeid)
        ).should.throwError()

