
iper = require '../index'

IperGraph = iper.IperGraph

describe 'IperGraph', ->
  describe 'constructor', ->
    it 'has signature ()', ->
      graph = new IperGraph()
      graph.should.be.instanceOf IperGraph

    it 'defaults edges to {}', ->
      graph = new IperGraph()
      graph.edges.should.eql {}

    it 'defaults nodes to {}', ->
      graph = new IperGraph()
      graph.nodes.should.eql {}

  describe 'methods', ->
    graph = new IperGraph()
    data2 = 'ciao'
    data3 = [1, 'x']

    describe 'createNode', ->
      it 'has signature ()'
        id1 = graph.createNode()

      it 'has signature (any)'
        id2 = graph.createNode(data2)
        id3 = graph.createNode(data3)

    describe 'readNode', ->
      it 'has signature (id)'
        graph.readNode(id2).should.be.eql data2
        graph.readNode(id3).should.be.eql data3

    describe 'updateNode', ->

    describe 'deleteNode', ->

    describe 'createEdge', ->

    describe 'readEdge', ->

    describe 'updateEdge', ->

    describe 'deleteEdge', ->

