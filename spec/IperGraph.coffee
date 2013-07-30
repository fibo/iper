
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

    it 'defaults edges to {}', ->
      graph = new IperGraph()
      graph.edges.should.eql {}

    it 'defaults nodes to {}', ->
      graph = new IperGraph()
      graph.nodes.should.eql {}

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

