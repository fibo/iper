var IperNode, iper, _;

_ = require('underscore');

iper = require('../index');

IperNode = iper.IperNode;

describe('IperNode', function() {
  return describe('constructor', function() {
    it('has signature (data)', function() {
      var data, node;
      data = 1;
      node = new IperNode(data);
      return node.should.be.instanceOf(IperNode);
    });
    return it('has signature (data, check)', function() {
      var check, data, node;
      check = _.isArray;
      data = [1, 2, 3];
      node = new IperNode(data, check);
      node.should.be.instanceOf(IperNode);
      it('requires `check` to be a function', function() {});
      return (function() {
        return node = new IperNode({}, 'not a function');
      }).should.throwError();
    });
  });
});
