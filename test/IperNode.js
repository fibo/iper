var IperNode, iper;

iper = require('../index');

IperNode = iper.IperNode;

describe('IperNode', function() {
  return describe('constructor', function() {
    it('has signature (data)', function() {});
    it('has signature (data, checkData)', function() {
      var arrayNode, isArray;
      isArray = function() {
        return 'whatever';
      };
      arrayNode = new IperNode([], isArray);
      return arrayNode.should.be.instanceOf(IperNode);
    });
    return it('requires checkData to be a function, if provided', function() {
      return (function() {
        var node;
        return node = new IperNode({}, 'not a function');
      }).should.throwError();
    });
  });
});
