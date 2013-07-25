
iper = require '../index'

IperGraph = iper.IperGraph

describe 'IperGraph', ->
  describe 'constructor', ->
    it 'has signature ()', ->
      graph = new IperGraph()
      graph.should.be.instanceOf IperGraph

    it 'defaults edges to []', ->
      graph = new IperGraph()
      graph.edges.should.eql {}

    it 'defaults nodes to []', ->
      graph = new IperGraph()
      graph.nodes.should.eql {}

  describe 'methods', ->
    describe 'deleteEdge', ->

    describe 'pushEdge', ->

    describe 'deleteNode', ->

    describe 'pushNode', ->

