var IperElement, iper;

iper = require('../index');

IperElement = iper.IperElement;

describe('IperElement', function() {
  describe('constructor', function() {
    return it('has signature ()', function() {
      var element;
      element = new IperElement();
      return element.should.be.instanceOf(IperElement);
    });
  });
  return describe('attributes', function() {
    return describe('id', function() {});
  });
});
