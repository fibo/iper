
iper = require '../index'

IperEdge    = iper.IperEdge
IperElement = iper.IperElement
IperGraph   = iper.IperGraph
IperNode    = iper.IperNode

data = [1, 2, 3]
graph = new IperGraph()

describe 'IperNode', ->
  it 'is an IperElement', ->
    node = new IperNode()
    node.should.be.instanceOf IperElement

  describe 'constructor', ->
    it 'has signature ()', ->
      node = new IperNode()
      node.should.be.instanceOf IperNode

    it 'has signature (graph, data)', ->
      node = new IperNode(graph, data)
      node.should.be.instanceOf IperNode

