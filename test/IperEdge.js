var IperEdge, IperNode, iper;

iper = require('../index');

IperEdge = iper.IperEdge;

IperNode = iper.IperNode;

describe('IperEdge', function() {
  describe('inheritance', function() {
    return it('is an IperNode', function() {
      var edge;
      edge = new IperEdge();
      return edge.should.be.instanceOf(IperNode);
    });
  });
  describe('constructor', function() {
    return it('has signature (data)', function() {});
  });
  return describe('methods', function() {});
});
