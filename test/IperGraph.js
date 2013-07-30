var IperGraph, IperNode, iper;

iper = require('../index');

IperGraph = iper.IperGraph;

IperNode = iper.IperNode;

describe('IperGraph', function() {
  describe('inheritance', function() {
    return it('is an IperNode', function() {
      var graph;
      graph = new IperGraph();
      return graph.should.be.instanceOf(IperNode);
    });
  });
  describe('constructor', function() {
    it('has signature ()', function() {
      var graph;
      graph = new IperGraph();
      return graph.should.be.instanceOf(IperGraph);
    });
    it('has signature (iperGraphData)', function() {
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
    return it('checks iperGraphData is valid', function() {});
  });
  return describe('methods', function() {
    describe('createNode', function() {
      return it('has signature (any)');
    });
    describe('readNode', function() {
      return it('has signature (id)');
    });
    describe('updateNode', function() {});
    describe('deleteNode', function() {});
    describe('createEdge', function() {});
    describe('readEdge', function() {});
    describe('updateEdge', function() {});
    return describe('deleteEdge', function() {});
  });
});
