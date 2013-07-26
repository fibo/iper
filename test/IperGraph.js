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
    it('defaults edges to {}', function() {
      var graph;
      graph = new IperGraph();
      return graph.edges.should.eql({});
    });
    return it('defaults nodes to {}', function() {
      var graph;
      graph = new IperGraph();
      return graph.nodes.should.eql({});
    });
  });
  return describe('methods', function() {
    describe('createEdge', function() {});
    describe('readEdge', function() {});
    describe('updateEdge', function() {});
    describe('deleteEdge', function() {});
    describe('createNode', function() {});
    describe('readNode', function() {});
    describe('updateNode', function() {});
    return describe('deleteNode', function() {});
  });
});
