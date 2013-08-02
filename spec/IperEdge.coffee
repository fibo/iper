
iper = require '../index'

IperEdge = iper.IperEdge
IperNode = iper.IperNode

describe 'IperEdge', ->
  describe 'inheritance', ->
    it 'is an IperNode', ->
      edge = new IperEdge()
      edge.should.be.instanceOf IperNode

  describe 'constructor', ->
    it 'has signature (iperEdgeData)', ->

  describe 'methods', ->

