var IperEdge, IperElement, IperGraph, IperNode, check, data, graph, iper, _;

_ = require('underscore');

iper = require('../index');

IperEdge = iper.IperEdge;

IperElement = iper.IperElement;

IperGraph = iper.IperGraph;

IperNode = iper.IperNode;

check = _.isArray;

data = [1, 2, 3];

graph = new IperGraph();

describe('IperNode', function() {
  it('is an IperElement', function() {
    var node;
    node = new IperNode(graph);
    return node.should.be.instanceOf(IperElement);
  });
  return describe('constructor', function() {
    it('has signature (graph, data, check)', function() {});
    it('requires `graph` to be an IperGraph', function() {
      return (function() {
        var node;
        return node = new IperNode('not a graph', check, data);
      }).should.throwError();
    });
    return it('requires `check` to be a function', function() {});
  });
});
