
var iper = require('../index')

var IperEdge    = iper.IperEdge
  , IperElement = iper.IperElement
  , IperGraph   = iper.IperGraph
  , IperNode    = iper.IperNode

var graph = new IperGraph()

describe('IperNode', function () {
  describe('Inheritance', function () {
    it('is an IperElement', function () {
      var node
      node = new IperNode(graph)
      node.should.be.instanceOf(IperElement)
    })
  })

  describe('Constructor', function () {
    it('has signature (graph)', function () {
      var node
      node = new IperNode(graph)
      node.should.be.instanceOf(IperNode)
    })

    it('has signature (graph, opts)', function () {
      var maxDegree, node, opts
      maxDegree = 2
      opts = {
        maxDegree: maxDegree
      }
      node = new IperNode(graph, opts)
      node.should.be.instanceOf(IperNode)
      node.maxDegree.should.be.eql(maxDegree)
    })

    it('registers node in graph', function () {
      var node
      node = new IperNode(graph)
      graph.getNode(node.id).should.be.eql(node)
    })
  })

  describe('Attributes', function () {
    describe('#maxDegree', function () {
      it('returns max number of edges allowed', function () {
        var maxDegree, node, opts
        maxDegree = 4
        opts = {
          maxDegree: maxDegree
        }
        node = new IperNode(graph, opts)
        node.maxDegree.should.be.eql(maxDegree)
      })
    })

    describe('#degree', function () {
      it('returns number of edges linked', function () {
        var id1 , id2 , id3
          , node1, node2, node3
          , graph = new IperGraph()

        id1 = graph.createNode()
        id2 = graph.createNode()
        id3 = graph.createNode()

        node1 = graph.getNode(id1)
        node2 = graph.getNode(id2)
        node3 = graph.getNode(id3)

        graph.createEdge([id1, id2])

        node1.degree.should.be.eql(1)
        node2.degree.should.be.eql(1)
        node3.degree.should.be.eql(0)

        graph.createEdge([id2, id3])

        node1.degree.should.be.eql(1)
        node2.degree.should.be.eql(2)
        node3.degree.should.be.eql(1)

        graph.createEdge([id3, id1])

        node1.degree.should.be.eql(2)
        node2.degree.should.be.eql(2)
        node3.degree.should.be.eql(2)
      })

      it('counts loops', function () {
        var id1 , id2
          , node1, node2

        id1 = graph.createNode()
        graph.createEdge([id1, id1])
        node1 = graph.getNode(id1)
        node1.degree.should.be.eql(2)

        id2 = graph.createNode()
        graph.createEdge([id2, id2, id2])
        node2 = graph.getNode(id2)
        node2.degree.should.be.eql(3)
      })
    })
  })
  describe('Methods', function () {
    describe('#getAdjacentNodeIds()', function () {
      var adjcentNodes = []
        , graph = new IperGraph()
        , id1, id2, id3, id4
        , node

      id1 = graph.createNode()
      id2 = graph.createNode()
      id3 = graph.createNode()
      id4 = graph.createNode()
      node = graph.getNode(id1)

      it('returns an empty array if there is no edge connected', function () {
        adjcentNodes = node.getAdjacentNodeIds()
        adjcentNodes.should.be.instanceOf(Array)
        adjcentNodes.should.be.empty
      })

      it('does not count loops', function () {
        graph.createEdge([id1, id1])
        adjcentNodes = node.getAdjacentNodeIds()
        adjcentNodes.should.be.empty
      })

      it('returns ids of nodes in hyperedges connected to the node', function () {
        graph.createEdge([id1, id2])
        adjcentNodes = node.getAdjacentNodeIds()
        adjcentNodes.should.be.eql([id2])

        graph.createEdge([id2, id3])
        adjcentNodes = node.getAdjacentNodeIds()
        adjcentNodes.should.be.eql([id2])

        graph.createEdge([id1, id2])
        adjcentNodes = node.getAdjacentNodeIds()
        adjcentNodes.should.be.eql([id2])

        graph.createEdge([id1, id2, id3])
        adjcentNodes = node.getAdjacentNodeIds()
        adjcentNodes.should.be.eql([id2, id3])

        graph.createEdge([id1, id4])
        adjcentNodes = node.getAdjacentNodeIds()
        adjcentNodes.should.be.eql([id2, id3, id4])
      })
      it('works when a node is removed', function () {
        graph.removeNode(id4)
        adjcentNodes = node.getAdjacentNodeIds()
        adjcentNodes.should.be.eql([id2, id3])
      })
    })
  })
})
