
iper = require '../index'

IperEdge    = iper.IperEdge
IperElement = iper.IperElement
IperGraph   = iper.IperGraph
IperNode    = iper.IperNode

describe 'IperGraph', ->
  it 'is an IperElement', ->
    graph = new IperGraph()
    graph.should.be.instanceOf IperElement

  describe 'constructor', ->
    it 'has signature ()', ->
      graph = new IperGraph()
      graph.should.be.instanceOf IperGraph

  describe 'methods', ->

    graph = new IperGraph()
    data = 'foo'

    describe '#createNode()', ->
      it 'has signature (data), returns nodeId', ->
        id = graph.createNode data
        id.should.be.defined

    describe '#getNode()', ->
      it 'has signature (id), returns node', ->
        id = graph.createNode data
        node = graph.getNode id
        node.should.be.instanceOf IperNode
        node.id.should.be.eql id

    describe '#check(data)', ->

      it 'checks data is valid', ->
        # invalid edge
        data =
          nodes:
            1: 'foo'
            2: 'bar'
          edges:
            3: [5, 6]

        (() ->
          graph.check(data)
        ).should.throwError()

        # edges without nodes does not make sense
        data =
          edges:
            1: [5, 6]
            2: [3, 4]

        (() ->
          graph.check(data)
        ).should.throwError()

    describe '#load(data)', ->

    describe '#deleteNode()', ->

    describe '#getEdge()', ->
      it 'has signature (id), returns edge', ->
        nodeId1 = graph.createNode(1)
        nodeId2 = graph.createNode(2)
        nodeIds = [nodeId1, nodeId2]

        id = graph.createEdge nodeIds
        edge = graph.getEdge id
        edge.should.be.instanceOf IperEdge
        edge.id.should.be.eql id

    describe '#createEdge()', ->
      it 'has signature ([id1, id2, ...]), returns edge', ->
        nodeId1 = graph.createNode(1)
        nodeId2 = graph.createNode(2)
        nodeIds = [nodeId1, nodeId2]

        id = graph.createEdge nodeIds
        edge = graph.getEdge id
        edge.should.be.instanceOf IperEdge
        edge.id.should.be.eql id

    describe '#deleteEdge()', ->

###


    # it 'has signature (data)', ->
    #   # This is a simple directed graph
    #   # foo -> bar
    #   data =
    #     nodes:
    #       1: 'foo'
    #       2: 'bar'
    #     edges:
    #       3: [1, 2]

    #   graph = new IperGraph(data)
    #  graph.should.be.instanceOf IperGraph

    #  # This is a loop graph
    #  # foo -> foo
    #  data =
    #    nodes:
    #      1: 'foo'
    #    edges:
    #      2: [1, 1]

    #  graph = new IperGraph(data)
    #  graph.should.be.instanceOf IperGraph

    #  # This is a simple hypergraph
    #  # foo -> bar -> quz
    #  data =
    #    nodes:
    #      1: 'foo'
    #      2: 'bar'
    #      3: 'quz'
    #    edges:
    #      4: [1, 2, 3]

    #  graph = new IperGraph(data)
    #  graph.should.be.instanceOf IperGraph

###
