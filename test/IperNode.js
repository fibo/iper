var IperEdge, IperElement, IperGraph, IperNode, data, graph, iper;

iper = require('../index');

IperEdge = iper.IperEdge;

IperElement = iper.IperElement;

IperGraph = iper.IperGraph;

IperNode = iper.IperNode;

data = [1, 2, 3];

graph = new IperGraph();

describe('IperNode', function() {
  it('is an IperElement', function() {
    var node;
    node = new IperNode();
    return node.should.be.instanceOf(IperElement);
  });
  return describe('constructor', function() {
    it('has signature ()', function() {
      var node;
      node = new IperNode();
      return node.should.be.instanceOf(IperNode);
    });
    return it('has signature (graph, data)', function() {
      var node;
      node = new IperNode(graph, data);
      return node.should.be.instanceOf(IperNode);
    });
  });
});
