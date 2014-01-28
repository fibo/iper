'use strict'

var iper = require('../index')

var IperElement = iper.IperElement
  , IperGraph   = iper.IperGraph

var graph = new IperGraph()

describe('IperElement', function () {
  describe('Constructor', function () {
    it('has signature (graph)', function () {
      var element = new IperElement(graph)
      element.should.be.instanceOf(IperElement)
    })

    it('requires graph is defined', function () {
      ;(function () {
        var element
        element = new IperElement()
      }).should.throwError('graph is not defined')
    })
  })
  describe('Attributes', function () {
    describe('#id', function () {
      it('is a number', function () {
        var element = new IperElement(graph)
        element.id.should.be.a.number
      })
      it('should be unique', function () {
        var element1 = new IperElement(graph)
          , element2 = new IperElement(graph)

        element1.id.should.not.be.eql(element2.id)
      })
      it('is readonly', function () {
        var element = new IperElement(graph)

        ;(function () {
          element.id = 4
        }).should.throwError()
      })
    })
    describe('#graph', function () {
      it('returns the graph passed to constructor', function () {
        var element = new IperElement(graph)
        element.graph.should.be.eql(graph)
      })
    })
  })
})
