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
