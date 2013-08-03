var IperElement, IperGraph, iper;

iper = require('../index');

IperElement = iper.IperElement;

IperGraph = iper.IperGraph;

describe('IperElement', function() {
  describe('constructor', function() {
    it('has signature ()', function() {
      var element;
      element = new IperElement();
      return element.should.be.instanceOf(IperElement);
    });
    return it('has signature (graph)', function() {
      var element, graph;
      graph = new IperGraph();
      element = new IperElement(graph);
      return element.should.be.instanceOf(IperElement);
    });
  });
  return describe('attributes', function() {
    describe('id', function() {
      return it('is a number', function() {
        var element;
        return element = new IperElement();
      });
    });
    return describe('graph', function() {
      return it('returns the graph passed to constructor', function() {
        var element, graph;
        graph = new IperGraph();
        element = new IperElement(graph);
        return element.graph.should.be.eql(graph);
      });
    });
  });
});
