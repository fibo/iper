(function() {
  var IperEdge, IperElement, IperGraph, IperNode, iper, should;

  iper = require('../index');

  should = require('should');

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
          nodes: [1, 2],
          edges: {
            3: [1, 2]
          }
        };
        graph = new IperGraph(args);
        return graph.should.be.instanceOf(IperGraph);
      });
      it('has signature ({nodes})', function() {
        var args, graph;
        args = {
          nodes: [1, 2, 3, 4]
        };
        graph = new IperGraph(args);
        return graph.should.be.instanceOf(IperGraph);
      });
      return it('has signature ({rank})');
    });
    describe('Attributes', function() {
      return describe('#rank', function() {
        return it('returns graph rank');
      });
    });
    return describe('Methods', function() {
      var graph;
      graph = new IperGraph();
      describe('#createNode()', function() {
        return it('returns nodeId', function() {
          var id;
          id = graph.createNode;
          return id.should.be.defined;
        });
      });
      describe('#createSubgraph()', function() {
        return it('returns subgraphId');
      });
      describe('#getNode()', function() {
        it('has signature (id), returns node', function() {
          var id;
          return id = graph.createNode;
        });
        return it('throws error if nodeId does not exists', function() {
          return (function() {
            return graph.getNode(-1);
          }).should.throwError();
        });
      });
      describe('#check(data)', function() {
        it('checks data is valid', function() {
          var data;
          data = {
            nodes: [1, 2],
            edges: {
              3: [5, 6]
            }
          };
          return (function() {
            return graph.check(data);
          }).should.throwError();
        });
        return it('returns true on success', function() {
          var data;
          graph = new IperGraph();
          data = {
            nodes: [1, 2, 3],
            edges: {
              4: [1, 2, 3]
            }
          };
          return graph.check(data).should.be["true"];
        });
      });
      describe('#load(data)', function() {
        it('loads data', function() {});
        it('checks data is valid', function() {
          var data;
          data = {
            edges: {
              1: [5, 6],
              2: [3, 4]
            }
          };
          return (function() {
            return graph.load(data);
          }).should.throwError();
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
        return it('throws error if edge does not exists', function() {
          return (function() {
            return graph.getEdge(-1);
          }).should.throwError();
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
