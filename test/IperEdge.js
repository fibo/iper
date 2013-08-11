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
    it('requires graph is defined and nodeIds is an array', function() {
      (function() {
        var edge;
        return edge = new IperEdge();
      }).should.throwError();
      return (function() {
        var edge;
        return edge = new IperEdge(graph);
      }).should.throwError();
    });
    it('checks #nodeIds is an array of valid node ids', function() {
      return (function() {
        var edge;
        return edge = new IperEdge(graph, [-1, -2]);
      }).should.throwError();
    });
    return it('checks node #degree does not excede its #maxDegree', function() {
      var edge, id, meta;
      meta = {
        maxDegree: 2
      };
      id = graph.createNode('example', meta);
      edge = new IperEdge(graph, [id1, id]);
      edge = new IperEdge(graph, [id2, id]);
      return (function() {
        return edge = new IperEdge(graph, [id2, id]);
      }).should.throwError();
    });
  });
  describe('accessors', function() {
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
        (function() {
          return graph.getEdge(edgeId);
        }).should.throwError();
        return edge.should.exists;
      });
    });
  });
});
