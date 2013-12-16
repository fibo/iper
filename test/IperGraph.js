(function() {
  var IperEdge, IperElement, IperGraph, IperNode, iper, should;

  iper = require('../index');

  should = require('should');

  IperEdge = iper.IperEdge;

  IperElement = iper.IperElement;

  IperGraph = iper.IperGraph;

  IperNode = iper.IperNode;

  describe('IperGraph', function() {
    describe('inheritance', function() {
      return it('is an IperElement', function() {
        var graph;
        graph = new IperGraph();
        return graph.should.be.instanceOf(IperElement);
      });
    });
    describe('constructor', function() {
      it('has signature ()', function() {
        var graph;
        graph = new IperGraph();
        return graph.should.be.instanceOf(IperGraph);
      });
      it('has signature (data)', function() {
        var data, graph;
        data = {
          nodes: {
            1: 'foo',
            2: 'bar'
          },
          edges: {
            3: [1, 2]
          }
        };
        graph = new IperGraph(data);
        return graph.should.be.instanceOf(IperGraph);
      });
      return it('has signature (data, meta)');
    });
    describe('Attributes', function() {
      return describe('#data', function() {
        return it('returns graph data', function() {
          var data, edgeId1, graph, nodeId1, nodeId2;
          graph = new IperGraph();
          nodeId1 = graph.createNode('foo');
          nodeId2 = graph.createNode([1, 2]);
          edgeId1 = graph.createEdge([nodeId1, nodeId2]);
          data = {};
          data.nodes = {};
          data.edges = {};
          data.nodes[nodeId1] = 'foo';
          data.nodes[nodeId2] = [1, 2];
          data.edges[edgeId1] = [nodeId1, nodeId2];
          return graph.data.should.eql(data);
        });
      });
    });
    return describe('Methods', function() {
      var data, graph;
      graph = new IperGraph();
      data = 'foo';
      describe('#createNode()', function() {
        it('has signature (data), returns nodeId', function() {
          var id;
          id = graph.createNode(data);
          return id.should.be.defined;
        });
        return it('has signature (data, meta), returns nodeId', function() {
          var id, maxDegree, meta, node;
          maxDegree = 4;
          meta = {
            maxDegree: maxDegree
          };
          id = graph.createNode(data, meta);
          id.should.be.defined;
          node = graph.getNode(id);
          return node.maxDegree.should.eql(maxDegree);
        });
      });
      describe('#getNode()', function() {
        it('has signature (id), returns node', function() {
          var id, node;
          id = graph.createNode(data);
          node = graph.getNode(id);
          node.should.be.instanceOf(IperNode);
          return node.id.should.be.eql(id);
        });
        return it('throws error if edge does not exists', function() {
          return (function() {
            return graph.getNode(-1);
          }).should.throwError();
        });
      });
      describe('#check(data)', function() {
        it('checks data is valid', function() {
          data = {
            nodes: {
              1: 'foo',
              2: 'bar'
            },
            edges: {
              3: [5, 6]
            }
          };
          return (function() {
            return graph.check(data);
          }).should.throwError();
        });
        return it('returns trus on success', function() {
          graph = new IperGraph();
          data = {
            nodes: {
              1: 'foo',
              2: 'bar',
              3: 'quz'
            },
            edges: {
              4: [1, 2, 3]
            }
          };
          return graph.check(data).should.be["true"];
        });
      });
      describe('#load(data)', function() {
        it('loads data', function() {
          graph = new IperGraph();
          data = {
            nodes: {
              1: 'foo'
            },
            edges: {
              2: [1, 1]
            }
          };
          graph.load(data);
          return graph.check(graph.data).should.be["true"];
        });
        return it('checks data is valid', function() {
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
      });
      describe('#removeNode()', function() {
        it('has signature (id), removes node from its graph', function() {
          var nodeId;
          graph = new IperGraph();
          nodeId = graph.createNode();
          graph.removeNode(nodeId);
          return (function() {
            return graph.getNode(nodeid);
          }).should.throwError();
        });
        return it('removes edges left without nodes', function() {});
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
      return describe('#removeEdge()', function() {
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
    });
  });

}).call(this);
