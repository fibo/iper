var IperEdge, IperElement, IperGraph, IperNode, graph, id1, id2, id3, iper, nodeIds, should;

iper = require('../index');

should = require('should');

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
  describe('inheritance', function() {
    return it('is an IperElement', function() {
      var edge;
      edge = new IperEdge(graph, nodeIds);
      return edge.should.be.instanceOf(IperElement);
    });
  });
  describe('constructor', function() {
    it('has signature (graph, nodeIds)', function() {
      var edge;
      edge = new IperEdge(graph, nodeIds);
      return edge.should.be.instanceOf(IperEdge);
    });
    return it('checks #nodeIds is an array of valid node ids', function() {
      return (function() {
        var edge;
        return edge = new IperEdge(graph, [-1, -2]);
      }).should.throwError();
    });
  });
  describe('accessors', function() {
    describe('#id', function() {
      return it('returns the edge #id', function() {
        var edge;
        edge = new IperEdge(graph, nodeIds);
        return edge.id.should.be.a.number;
      });
    });
    return describe('#nodeIds', function() {
      return it('returns the #nodeIds', function() {
        var edge;
        edge = new IperEdge(graph, nodeIds);
        return edge.nodeIds.should.eql(nodeIds);
      });
    });
  });
  return describe('methods', function() {
    return describe('#remove()', function() {
      return it('removes the edge from its graph', function() {
        var edge, edgeId;
        edge = new IperEdge(graph, nodeIds);
        edgeId = edge.id;
        edge.remove();
        return should.not.exist(graph.getEdge(edgeId));
      });
    });
  });
});
