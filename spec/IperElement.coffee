
iper = require '../index'

IperElement = iper.IperElement
IperGraph   = iper.IperGraph

describe 'IperElement', ->

  describe 'constructor', ->
    it 'has signature ()', ->
      element = new IperElement()
      element.should.be.instanceOf IperElement

    it 'has signature (graph)', ->
      graph = new IperGraph()
      element = new IperElement(graph)
      element.should.be.instanceOf IperElement

  describe 'attributes', ->
    describe 'id', ->
      it 'is a number', ->
        element = new IperElement()
        element.id.should.be.a.number

      it 'should be unique', ->
        element1 = new IperElement()
        element2 = new IperElement()

        element1.id.should.not.be.eql element2.id

    describe 'graph', ->
      it 'returns the graph passed to constructor', ->
        graph = new IperGraph()
        element = new IperElement(graph)

        element.graph.should.be.eql graph

