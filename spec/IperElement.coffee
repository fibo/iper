
'use strict'

iper = require '../index'

IperElement = iper.IperElement
IperGraph   = iper.IperGraph

graph = new IperGraph()

describe 'IperElement', ->

  describe 'Constructor', ->
    it 'has signature (graph)', ->
      element = new IperElement(graph)
      element.should.be.instanceOf IperElement

  describe 'Attributes', ->
    describe '#id', ->
      it 'is a number', ->
        element = new IperElement(graph)
        element.id.should.be.a.number

      it 'should be unique', ->
        element1 = new IperElement(graph)
        element2 = new IperElement(graph)

        element1.id.should.not.be.eql element2.id

      it 'is readonly', ->
        element = new IperElement(graph)

        ( () ->
            element.id = 4
        ).should.throwError()

    describe '#graph', ->
      it 'returns the graph passed to constructor', ->
        element = new IperElement(graph)

        element.graph.should.be.eql graph

