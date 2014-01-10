(function() {
  var IperEdge, IperElement, IperGraph, IperNode, iper, should, _;

  iper = require('../index');

  should = require('should');

  _ = require('underscore');

  IperEdge = iper.IperEdge;

  IperElement = iper.IperElement;

  IperGraph = iper.IperGraph;

  IperNode = iper.IperNode;

  describe('IperGraph', function() {
    describe('Inheritance', function() {
      return it('is an IperElement', function() {
        var graph;
        graph = new IperGraph();
        return graph.should.be.instanceOf(IperElement);
      });
    });
    describe('Constructor', function() {
      it('has signature ()', function() {
        var graph;
        graph = new IperGraph();
        return graph.should.be.instanceOf(IperGraph);
      });
      it('has signature ({nodes, edges})', function() {
        var args, graph;
        args = {
          nodes: [
            {
              id: 1
            }, {
              id: 2
            }
          ],
          edges: {
            id: 3,
            nodeIds: [1, 2]
          }
        };
        graph = new IperGraph(args);
        return graph.should.be.instanceOf(IperGraph);
      });
      it('has signature ({nodes})', function() {
        var args, graph;
        args = {
          nodes: [
            {
              id: 1
            }, {
              id: 2
            }, {
              id: 3
            }, {
              id: 4
            }
          ]
        };
        graph = new IperGraph(args);
        return graph.should.be.instanceOf(IperGraph);
      });
      return it('has signature ({rank})', function() {
        var graph;
        graph = new IperGraph({
          rank: 2
        });
        return graph.should.be.instanceOf(IperGraph);
      });
    });
    describe('Attributes', function() {});
    return describe('Methods', function() {
      var graph;
      graph = new IperGraph();
      describe('#createNode()', function() {
        return it('returns nodeId', function() {
          var id;
          id = graph.createNode();
          return id.should.be.a.number;
        });
      });
      describe('#createSubgraph()', function() {
        return it('returns subgraphId', function() {
          var id;
          id = graph.createSubgraph();
          return id.should.be.a.number;
        });
      });
      describe('#getNode()', function() {
        it('has signature (id), returns node', function() {
          var id, node;
          id = graph.createNode();
          node = graph.getNode(id);
          node.should.be.instanceOf(IperNode);
          return node.id.should.be.eql(id);
        });
        return it('throws error if nodeId does not exists', function() {
          return (function() {
            return graph.getNode(-1);
          }).should.throwError('node is not defined');
        });
      });
      describe('#check(data)', function() {
        it('throws *invalid edge*', function() {
          var data;
          data = {
            nodes: [
              {
                id: 1
              }, {
                id: 2
              }
            ],
            edges: [
              {
                id: 3,
                nodeIds: [5, 6]
              }
            ]
          };
          return (function() {
            return graph.check(data);
          }).should.throwError('invalid edge');
        });
        it('throws *duplicated node id*', function() {
          var data;
          data = {
            nodes: [
              {
                id: 1
              }, {
                id: 2
              }, {
                id: 2
              }
            ]
          };
          return (function() {
            return graph.check(data);
          }).should.throwError('duplicated node id');
        });
        return it('returns true on success', function() {
          var data;
          graph = new IperGraph();
          data = {
            nodes: [
              {
                id: 1
              }, {
                id: 2
              }, {
                id: 3
              }
            ],
            edges: {
              id: 4,
              nodeIds: [1, 2, 3]
            }
          };
          return graph.check(data).should.be["true"];
        });
      });
      describe('#load(data)', function() {
        it('loads data', function() {
          var data;
          graph = new IperGraph();
          data = {
            nodes: [
              {
                id: 1
              }, {
                id: 2
              }
            ],
            edges: [
              {
                id: 3,
                nodeIds: [1, 2]
              }
            ]
          };
          graph.load(data);
          _.each(graph.nodes, function(node) {
            return node.should.be.instanceOf(IperNode);
          });
          return _.each(graph.edges, function(edge) {
            return edge.should.be.instanceOf(IperEdge);
          });
        });
        it('checks data is valid', function() {
          var data;
          data = {
            edges: [
              {
                id: 1,
                nodeIds: [3, 4]
              }, {
                id: 2,
                nodeIds: [5, 6]
              }
            ]
          };
          return (function() {
            return graph.load(data);
          }).should.throwError('invalid edge');
        });
        return it('removes edges left without nodes');
      });
      describe('#getEdge()', function() {
        it('has signature (id), returns edge', function() {
          var edge, id, nodeId1, nodeId2, nodeIds;
          nodeId1 = graph.createNode(1);
          nodeId2 = graph.createNode(2);
          nodeIds = [nodeId1, nodeId2];
          id = graph.createEdge(nodeIds);
          edge = graph.getEdge(id);
          edge.should.be.instanceOf(IperEdge);
          return edge.id.should.be.eql(id);
        });
        return it('throws *edge not found*', function() {
          return (function() {
            return graph.getEdge(-1);
          }).should.throwError('edge not found');
        });
      });
      describe('#createEdge()', function() {
        return it('has signature ([id1, id2, ...]), returns edge', function() {
          var edge, id, nodeId1, nodeId2, nodeIds;
          nodeId1 = graph.createNode(1);
          nodeId2 = graph.createNode(2);
          nodeIds = [nodeId1, nodeId2];
          id = graph.createEdge(nodeIds);
          edge = graph.getEdge(id);
          edge.should.be.instanceOf(IperEdge);
          return edge.id.should.be.eql(id);
        });
      });
      describe('#removeEdge()', function() {
        return it('has signature (id), removes edge from its graph', function() {
          var edgeId, nodeId1, nodeId2;
          graph = new IperGraph();
          nodeId1 = graph.createNode();
          nodeId2 = graph.createNode();
          edgeId = graph.createEdge([nodeId1, nodeId2]);
          graph.removeEdge(edgeId);
          return (function() {
            return graph.getEdge(edgeId);
          }).should.throwError();
        });
      });
      return describe('#removeNode()', function() {
        return it('has signature (id), removes node from its graph', function() {
          var nodeId;
          graph = new IperGraph();
          nodeId = graph.createNode();
          graph.removeNode(nodeId);
          return (function() {
            return graph.getNode(nodeid);
          }).should.throwError();
        });
      });
    });
  });

}).call(this);
