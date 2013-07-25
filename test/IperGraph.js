var IperGraph, iper;

iper = require('../index');

IperGraph = iper.IperGraph;

describe('IperGraph', function() {
  describe('constructor', function() {
    it('has signature ()', function() {
      var graph;
      graph = new IperGraph();
      return graph.should.be.instanceOf(IperGraph);
    });
    it('defaults edges to []', function() {
      var graph;
      graph = new IperGraph();
      return graph.edges.should.eql({});
    });
    return it('defaults nodes to []', function() {
      var graph;
      graph = new IperGraph();
      return graph.nodes.should.eql({});
    });
  });
  return describe('methods', function() {
    describe('deleteEdge', function() {});
    describe('pushEdge', function() {});
    describe('deleteNode', function() {});
    return describe('pushNode', function() {});
  });
});
