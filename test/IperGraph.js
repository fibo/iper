
var iper   = require('../index')
  , should = require('should')
  , _      = require('underscore')

var IperEdge  = iper.IperEdge
  , IperGraph = iper.IperGraph
  , IperNode  = iper.IperNode

describe('IperGraph', function () {
  describe('Constructor', function () {
    it('has signature ()', function () {
      var graph = new IperGraph()

      graph.should.be.instanceOf(IperGraph)
    })

    it('has signature ({nodes: [], edges: []})', function () {
      var args = {
        nodes: [
          { id: 1 },
          { id: 2 }
        ],
        edges: [
          { id: 3, nodeIds: [1, 2] }
        ]
      }

      var graph = new IperGraph(args)

      graph.should.be.instanceOf(IperGraph)
    })

    it('has signature ({nodes: []})', function () {
      var args = {
        nodes: [
          { id: 1 },
          { id: 2 },
          { id: 3 },
          { id: 4 }
        ]
      }

      var graph = new IperGraph(args)

      graph.should.be.instanceOf(IperGraph)
    })

    it('has signature ({rank})', function () {
      var graph = new IperGraph({ rank: 2 })

      graph.should.be.instanceOf(IperGraph)
    })
  })

  describe('Attributes', function () {})
    describe('Methods', function () {
      var graph = new IperGraph()

      describe('#createNode()', function () {
        it('returns nodeId', function () {
          var id = graph.createNode()

          id.should.be.a.number
        })
      })

      describe('#getNode()', function () {
        it('has signature (id), returns node', function () {
          var id   = graph.createNode()
            , node = graph.getNode(id)

          node.should.be.instanceOf(IperNode)
          node.id.should.be.eql(id)
        })

        it('throws *node not found*', function () {
          ;(function () {
             graph.getNode(-1)
          }).should.throwError('node not found')
        })
      })

      describe('#check(data)', function () {
        it('throws *invalid edge*', function () {
          var data = {
            nodes: [
              { id: 1 },
              { id: 2 }
            ],
            edges: [
              { id: 3, nodeIds: [5, 6] }
            ]
          }

          ;(function () {
            graph.check(data)
          }).should.throwError('invalid edge')
        })

        it('throws *duplicated node id*', function () {
          var data = {
            nodes: [
              { id: 1 },
              { id: 2 },
              { id: 2 }
            ]
          }

          ;(function () {
            graph.check(data)
          }).should.throwError('duplicated node id')
        })

        it('returns true on success', function () {
          var data
          graph = new IperGraph()
          data = {
            nodes: [
              { id: 1 },
              { id: 2 },
              { id: 3 }
            ],
            edges: [
             { id: 4, nodeIds: [1, 2, 3] }
            ]
          }

          graph.check(data).should.be["true"]
        })
      })

      describe('#load(data)', function () {
        it('loads data', function () {
          var graph = new IperGraph()
          var data = {
            nodes: [
              { id: 1 },
              { id: 2 }
            ],
            edges: [
              { id: 3, nodeIds: [1, 2] }
            ]
          }

          graph.load(data)

          _.each(graph.nodes, function(node) {
            node.should.be.instanceOf(IperNode)
          })

           _.each(graph.edges, function(edge) {
            edge.should.be.instanceOf(IperEdge)
          })
        })

        it('checks data is valid', function () {
          var data = {
            edges: [
              { id: 1, nodeIds: [3, 4] },
              { id: 2, nodeIds: [5, 6] }
            ]
          }

          ;(function () {
            graph.load(data)
          }).should.throwError('invalid edge')
        })
      })

      describe('#getEdge()', function () {
        it('has signature (id), returns edge', function () {
          var nodeId1 = graph.createNode(1)
            , nodeId2 = graph.createNode(2)
            , nodeIds = [nodeId1, nodeId2]

          var id = graph.createEdge(nodeIds)
          var edge = graph.getEdge(id)

          edge.should.be.instanceOf(IperEdge)
          edge.id.should.be.eql(id)
        })

        it('throws *edge not found*', function () {
          ;(function () {
            graph.getEdge(100)
          }).should.throwError('edge not found')
        })
      })

      describe('#createEdge()', function () {
        it('has signature ([id1, id2, ...]), returns edge', function () {
          var nodeId1 = graph.createNode(1)
          , nodeId2 = graph.createNode(2)
          , nodeIds = [nodeId1, nodeId2]

          var id = graph.createEdge(nodeIds)
          var edge = graph.getEdge(id)

          edge.should.be.instanceOf(IperEdge)
          edge.id.should.be.eql(id)
        })
      })

      describe('#removeEdge()', function () {
        it('has signature (id), removes edge from its graph', function () {
          var graph = new IperGraph()

          var nodeId1 = graph.createNode()
          , nodeId2 = graph.createNode()

          var edgeId = graph.createEdge([nodeId1, nodeId2])

          graph.removeEdge(edgeId)

          ;(function () {
            graph.getEdge(edgeId)
          }).should.throwError('edge not found')
        })
      })
      return describe('#removeNode()', function () {
        it('has signature (id), removes node from its graph', function () {
          var graph = new IperGraph()

          var nodeId = graph.createNode()

          graph.removeNode(nodeId)

          ;(function () {
            graph.getNode(nodeId)
          }).should.throwError('node not found')
        })

        it('removes edges left without nodes', function () {
          var nodeId1 = graph.createNode()
          , nodeId2 = graph.createNode()

          var nodeIds = [nodeId1, nodeId2]

          var edgeId = graph.createEdge(nodeIds)

          graph.removeNode(nodeId1)

          ;(function () {
            graph.getEdge(edgeId)
          }).should.throwError('edge not found')
        })
      })
    })
  })
