var IperGraph, IperNode, iper;

iper = require('../index');

IperGraph = iper.IperGraph;

IperNode = iper.IperNode;

describe('IperGraph', function() {
  describe('inheritance', function() {
    return it('is an IperNode', function() {
      var graph;
      graph = new IperGraph();
      return graph.should.be.instanceOf(IperNode);
    });
  });
  describe('constructor', function() {
    it('has signature ()', function() {
      var graph;
      graph = new IperGraph();
      return graph.should.be.instanceOf(IperGraph);
    });
    it('has signature (data)', function() {
      var data, graph;
      data = {
        nodes: {
          1: 'foo',
          2: 'bar'
        },
        edges: {
          3: [1, 2]
        }
      };
      graph = new IperGraph(data);
      graph.should.be.instanceOf(IperGraph);
      data = {
        nodes: {
          1: 'foo'
        },
        edges: {
          2: [1, 1]
        }
      };
      graph = new IperGraph(data);
      graph.should.be.instanceOf(IperGraph);
      data = {
        nodes: {
          1: 'foo',
          2: 'bar',
          3: 'quz'
        },
        edges: {
          4: [1, 2, 3]
        }
      };
      graph = new IperGraph(data);
      return graph.should.be.instanceOf(IperGraph);
    });
    return it('checks data is valid', function() {
      var data;
      data = {
        nodes: {
          1: 'foo',
          2: 'bar'
        },
        edges: {
          3: [5, 6]
        }
      };
      (function() {
        var graph;
        return graph = new IperGraph(data);
      }).should.throwError();
      return data = {
        edges: {
          1: [5, 6],
          2: [3, 4]
        }
      };
    });
  });
  return describe('methods', function() {
    var data1, graph, id1;
    graph = new IperGraph();
    id1 = null;
    data1 = 'foo';
    describe('#createNode()', function() {
      return it('has signature (data), returns nodeId', function() {
        id1 = graph.createNode(data1);
        return id1.should.be.defined;
      });
    });
    describe('#readNode()', function() {
      return it('has signature (id), returns nodeData', function() {
        var data;
        data = graph.readNode(id1);
        return data.should.be.eql(data1);
      });
    });
    describe('#updateNode()', function() {
      return it('has signature (id, data)', function() {});
    });
    describe('#deleteNode()', function() {});
    describe('#createEdge()', function() {});
    describe('#readEdge()', function() {});
    describe('#updateEdge()', function() {});
    return describe('#deleteEdge()', function() {});
  });
});
