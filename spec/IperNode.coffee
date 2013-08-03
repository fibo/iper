
_ = require 'underscore'

iper = require '../index'

IperEdge    = iper.IperEdge
IperElement = iper.IperElement
IperGraph   = iper.IperGraph
IperNode    = iper.IperNode

check = _.isArray
data = [1, 2, 3]
graph = new IperGraph()

describe 'IperNode', ->
  it 'is an IperElement', ->
    node = new IperNode(graph)
    node.should.be.instanceOf IperElement

  describe 'constructor', ->
    it 'has signature (graph, data, check)', ->
      # node = new IperNode(graph, data, check)
      # node.should.be.instanceOf IperNode

    it 'requires `graph` to be an IperGraph', ->
      (() ->
        node = new IperNode('not a graph', check, data)
      ).should.throwError()

    it 'requires `check` to be a function', ->
      # (() ->
      #   node = new IperNode({}, 'not a function')
      # ).should.throwError()

