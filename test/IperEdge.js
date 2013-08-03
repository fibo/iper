var IperEdge, IperElement, IperGraph, IperNode, iper;

iper = require('../index');

IperEdge = iper.IperEdge;

IperElement = iper.IperElement;

IperGraph = iper.IperGraph;

IperNode = iper.IperNode;

describe('IperEdge', function() {
  it('is an IperElement', function() {
    var edge;
    edge = new IperEdge();
    return edge.should.be.instanceOf(IperElement);
  });
  describe('constructor', function() {
    return it('has signature (data)', function() {});
  });
  return describe('methods', function() {});
});
