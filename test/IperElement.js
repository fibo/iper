(function() {
  'use strict';
  var IperElement, IperGraph, graph, iper;

  iper = require('../index');

  IperElement = iper.IperElement;

  IperGraph = iper.IperGraph;

  graph = new IperGraph();

  describe('IperElement', function() {
    describe('Constructor', function() {
      it('has signature (graph)', function() {
        var element;
        element = new IperElement(graph);
        return element.should.be.instanceOf(IperElement);
      });
      return it('requires graph is defined', function() {
        return (function() {
          var element;
          return element = new IperElement();
        }).should.throwError('graph is not defined');
      });
    });
    return describe('Attributes', function() {
      describe('#id', function() {
        it('is a number', function() {
          var element;
          element = new IperElement(graph);
          return element.id.should.be.a.number;
        });
        it('should be unique', function() {
          var element1, element2;
          element1 = new IperElement(graph);
          element2 = new IperElement(graph);
          return element1.id.should.not.be.eql(element2.id);
        });
        return it('is readonly', function() {
          var element;
          element = new IperElement(graph);
          return (function() {
            return element.id = 4;
          }).should.throwError();
        });
      });
      return describe('#graph', function() {
        return it('returns the graph passed to constructor', function() {
          var element;
          element = new IperElement(graph);
          return element.graph.should.be.eql(graph);
        });
      });
    });
  });

}).call(this);
