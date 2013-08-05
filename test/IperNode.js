var IperEdge, IperElement, IperGraph, IperNode, data, graph, iper;

iper = require('../index');

IperEdge = iper.IperEdge;

IperElement = iper.IperElement;

IperGraph = iper.IperGraph;

IperNode = iper.IperNode;

data = [1, 2, 3];

graph = new IperGraph();

describe('IperNode', function() {
  describe('inheritance', function() {
    return it('is an IperElement', function() {
      var node;
      node = new IperNode();
      return node.should.be.instanceOf(IperElement);
    });
  });
  describe('constructor', function() {
    it('has signature (graph)', function() {
      var node;
      node = new IperNode(graph);
      return node.should.be.instanceOf(IperNode);
    });
    return it('has signature (graph, data)', function() {
      var node;
      node = new IperNode(graph, data);
      return node.should.be.instanceOf(IperNode);
    });
  });
  return describe('methods', function() {
    return describe('#remove()', function() {
      return it('removes the node from its graph', function() {
        var node, nodeId;
        node = new IperNode(graph);
        nodeId = node.id;
        node.remove();
        (function() {
          return graph.getEdge(nodeId);
        }).should.throwError();
        return node.should.exists;
      });
    });
  });
});
