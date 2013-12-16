(function() {
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
    describe('Inheritance', function() {
      return it('is an IperElement', function() {
        var edge;
        edge = new IperEdge(graph, nodeIds);
        return edge.should.be.instanceOf(IperElement);
      });
    });
    describe('Constructor', function() {
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
    return describe('Attributes', function() {
      return describe('#nodeIds', function() {
        return it('returns the #nodeIds', function() {
          var edge;
          edge = new IperEdge(graph, nodeIds);
          return edge.nodeIds.should.eql(nodeIds);
        });
      });
    });
  });

  /*
    describe 'Methods', ->
      describe '#remove()', ->
        it 'removes the edge from its graph', ->
          edge = new IperEdge(graph, nodeIds)
          edgeId = edge.id
  
          edge.remove()
  
          (() ->
              graph.getEdge(edgeId)
          ).should.throwError()
  
          edge.should.exists
  */


}).call(this);
