
iper = require '../index'

IperGraph = iper.IperGraph
IperNode  = iper.IperNode

describe 'IperGraph', ->
  describe 'inheritance', ->
    it 'is an IperNode', ->
      graph = new IperGraph()
      graph.should.be.instanceOf IperNode

  describe 'constructor', ->
    it 'has signature ()', ->
      graph = new IperGraph()
      graph.should.be.instanceOf IperGraph

    it 'has signature (data)', ->
      # foo -> bar
      data =
        nodes:
          1: 'foo'
          2: 'bar'
        edges:
          3: [1, 2]

      graph = new IperGraph(data)
      graph.should.be.instanceOf IperGraph

    it 'checks data is valid', ->
      # # data with invalid edge
      # data =
      #   nodes:
      #     1: 'foo'
      #     2: 'bar'
      #   edges:
      #     3: [5, 6]

      # (() ->
      #   graph = new IperGraph(data)
      # ).should.throwError()

  describe 'methods', ->

    describe 'createNode', ->
      it 'has signature (any)'

    describe 'readNode', ->
      it 'has signature (id)'

    describe 'updateNode', ->

    describe 'deleteNode', ->

    describe 'createEdge', ->

    describe 'readEdge', ->

    describe 'updateEdge', ->

    describe 'deleteEdge', ->

