
var iper   = require('../index')
  , should = require('should')

var IperEdge    = iper.IperEdge
  , IperElement = iper.IperElement
  , IperGraph   = iper.IperGraph
  , IperNode    = iper.IperNode

var graph = new IperGraph()

var id1 = graph.createNode()
  , id2 = graph.createNode()
  , id3 = graph.createNode()

var nodeIds = [id1, id2, id3]

describe('IperEdge', function () {
  describe('Inheritance', function () {
    it('is an IperElement', function () {
      var edge = new IperEdge(graph, nodeIds)
      edge.should.be.instanceOf(IperElement)
    })
  })

  describe('Constructor', function () {
    it('has signature (graph, nodeIds)', function () {
      var edge = new IperEdge(graph, nodeIds)
      edge.should.be.instanceOf(IperEdge)
    })

    it('requires graph is defined and nodeIds is an array', function () {
      ;(function () {
        var edge = new IperEdge()
      }).should.throwError()

      ;(function () {
        var edge = new IperEdge(graph)
      }).should.throwError()
    })

    it('checks #nodeIds is an array of valid node ids', function () {
      ;(function () {
        var edge = new IperEdge(graph, [-1, -2])
      }).should.throwError()
    })

    it('checks node *degree* does not excede its #maxDegree', function () {
      var edge
        , id
        , opts = {
            maxDegree: 2
          }

      id = graph.createNode(opts)
      edge = new IperEdge(graph, [id1, id])
      edge = new IperEdge(graph, [id2, id])

      ;(function () {
        edge = new IperEdge(graph, [id2, id])
      }).should.throwError()
    })

    it('registers edge in graph', function () {
      var edge = new IperEdge(graph, [id1, id2])
      graph.getEdge(edge.id).should.be.eql(edge)
    })
  })

  describe('Attributes', function () {
    describe('#nodeIds', function () {
      it('returns the #nodeIds', function () {
        var edge = new IperEdge(graph, nodeIds)
        edge.nodeIds.should.eql(nodeIds)
      })
    })
  })

  describe('Methods', function () {
    describe('#remove()', function () {
      it('removes the edge from its graph', function () {
        var edge
          , edgeId;

        edge = new IperEdge(graph, nodeIds)
        edgeId = edge.id
        edge.remove()

        ;(function () {
          graph.getEdge(edgeId)
        }).should.throwError()

        edge.should.exists
      })
    })
  })
})

