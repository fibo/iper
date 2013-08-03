
iper = require '../index'

IperEdge    = iper.IperEdge
IperElement = iper.IperElement
IperGraph   = iper.IperGraph
IperNode    = iper.IperNode

describe 'IperEdge', ->
  it 'is an IperElement', ->
    edge = new IperEdge()
    edge.should.be.instanceOf IperElement

  describe 'constructor', ->
    it 'has signature (data)', ->

  describe 'methods', ->

