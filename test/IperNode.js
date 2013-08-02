var IperNode, iper;

iper = require('../index');

IperNode = iper.IperNode;

describe('IperNode', function() {
  return describe('constructor', function() {
    it('has signature (data)', function() {});
    return it('has signature (data, check)', function() {
      var arrayNode, isArray;
      isArray = function() {
        return 'whatever';
      };
      arrayNode = new IperNode([], isArray);
      arrayNode.should.be.instanceOf(IperNode);
      it('requires `check` to be a function, if provided', function() {});
      return (function() {
        var node;
        return node = new IperNode({}, 'not a function');
      }).should.throwError();
    });
  });
});
