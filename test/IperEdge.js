var IperEdge, IperElement, IperGraph, IperNode, graph, id1, id2, id3, iper, nodeIds;

iper = require('../index');

IperEdge = iper.IperEdge;

IperElement = iper.IperElement;

IperGraph = iper.IperGraph;

IperNode = iper.IperNode;

graph = new IperGraph();

id1 = graph.createNode(1);

id2 = graph.createNode(2);

id3 = graph.createNode(3);

nodeIds = [id1, id2, id3];

describe('IperEdge', function() {
  it('is an IperElement', function() {
    var edge;
    edge = new IperEdge(graph, nodeIds);
    return edge.should.be.instanceOf(IperElement);
  });
  return describe('constructor', function() {
    it('has signature (graph, nodeIds)', function() {
      var edge;
      edge = new IperEdge(graph, nodeIds);
      return edge.should.be.instanceOf(IperEdge);
    });
    return it('checks nodeIds is an array of valid node ids', function() {
      return (function() {
        var edge;
        return edge = new IperEdge(graph, [-1, -2]);
      }).should.throwError();
    });
  });
});
