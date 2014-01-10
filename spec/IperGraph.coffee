
iper   = require '../index'
should = require 'should'
_      = require 'underscore'

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
        nodes: [
          { id: 1 }
          { id: 2 }
        ]
        edges:
          { id: 3, nodeIds: [1, 2] }

      graph = new IperGraph(args)
      graph.should.be.instanceOf IperGraph

    it 'has signature ({nodes})', ->
      # This is a graph without nodes
      args =
        nodes: [
          { id: 1 }
          { id: 2 }
          { id: 3 }
          { id: 4 }
        ]

      graph = new IperGraph(args)
      graph.should.be.instanceOf IperGraph

    it 'has signature ({rank})', ->
      graph = new IperGraph({rank: 2})
      graph.should.be.instanceOf IperGraph

  describe 'Attributes', ->
    # TODO describe uniform, nodes, edges, subgraphs, rank

  describe 'Methods', ->
    graph = new IperGraph()

    describe '#createNode()', ->
      it 'returns nodeId', ->
        id = graph.createNode()
        id.should.be.a.number

    describe '#createSubgraph()', ->
      it 'returns subgraphId', ->
        id = graph.createSubgraph()
        id.should.be.a.number

    describe '#getNode()', ->
      it 'has signature (id), returns node', ->
        id = graph.createNode()
        node = graph.getNode id
        node.should.be.instanceOf IperNode
        node.id.should.be.eql id

      it 'throws error if nodeId does not exists', ->
        (() ->
          graph.getNode(-1)
        ).should.throwError('node is not defined')

    describe '#check(data)', ->
      it 'throws *invalid edge*', ->
        # an invalid edge refers to nodeIds that do not exists
        data =
          nodes: [
            { id: 1 }
            { id: 2 }
          ]
          edges: [
            { id: 3, nodeIds: [5, 6] }
          ]

        (() ->
          graph.check(data)
        ).should.throwError('invalid edge')


      it 'throws *duplicated node id*', ->
        data =
          nodes: [
            { id: 1 }
            { id: 2 }
            { id: 2 }
          ]

        (() ->
          graph.check(data)
        ).should.throwError('duplicated node id')

      it 'returns true on success', ->
        # TODO sarebbe meglio che ritornasse i dati depurati
        graph = new IperGraph()

        # TODO da mettere in esempio hyperedge
        # This is a simple hypergraph
        # 1 -> 2 -> 3
        data =
          nodes: [
            { id: 1 }
            { id: 2 }
            { id: 3 }
          ]
          edges:
            { id: 4, nodeIds: [1, 2, 3] }

        graph.check(data).should.be.true

    describe '#load(data)', ->
      it 'loads data' , ->
        graph = new IperGraph()

        # This is a loop graph
        # TODO da mettere in esempio loops
        # 1 -> 1
        #data =
        #  nodes:
        #    { id: 1 }
        #  edges:
        #    { id: 2, nodeIds: [1, 1] }

        data =
          nodes: [
            { id: 1 }
            { id: 2 }
          ]
          edges: [
            { id: 3, nodeIds: [1, 2] }
          ]

        graph.load(data)

        _.each(graph.nodes,
        (node) ->
          node.should.be.instanceOf IperNode
        )

        _.each(graph.edges,
        (edge) ->
          edge.should.be.instanceOf IperEdge
        )

      it 'checks data is valid', ->
        # edges without nodes does not make sense
        data =
          edges: [
            { id: 1, nodeIds: [3, 4] }
            { id: 2, nodeIds: [5, 6] }
          ]

        (() ->
          graph.load(data)
        ).should.throwError('invalid edge')

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

      it 'throws *edge not found*', ->
        (() ->
          graph.getEdge(-1)
        ).should.throwError('edge not found')

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

