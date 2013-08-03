var IperEdge, IperElement, IperGraph, IperNode, iper;

iper = require('../index');

IperEdge = iper.IperEdge;

IperElement = iper.IperElement;

IperGraph = iper.IperGraph;

IperNode = iper.IperNode;

describe('IperGraph', function() {
  it('is an IperElement', function() {
    var graph;
    graph = new IperGraph();
    return graph.should.be.instanceOf(IperElement);
  });
  describe('constructor', function() {
    return it('has signature ()', function() {
      var graph;
      graph = new IperGraph();
      return graph.should.be.instanceOf(IperGraph);
    });
  });
  return describe('methods', function() {
    var data, graph;
    graph = new IperGraph();
    data = 'foo';
    describe('#createNode()', function() {
      return it('has signature (data), returns nodeId', function() {
        var id;
        id = graph.createNode(data);
        return id.should.be.defined;
      });
    });
    describe('#getNode()', function() {
      return it('has signature (id), returns node', function() {
        var id, node;
        id = graph.createNode(data);
        node = graph.getNode(id);
        return node.should.be.instanceOf(IperNode);
      });
    });
    describe('#check(data)', function() {
      return it('checks data is valid', function() {
        data = {
          nodes: {
            1: 'foo',
            2: 'bar'
          },
          edges: {
            3: [5, 6]
          }
        };
        return (function() {
          return graph.check(data);
        }).should.throwError();
      });
    });
    describe('#load(data)', function() {});
    describe('#deleteNode()', function() {});
    describe('#createEdge()', function() {});
    describe('#getEdge()', function() {});
    return describe('#deleteEdge()', function() {});
  });
});

/*


    # it 'has signature (data)', ->
    #   # This is a simple directed graph
    #   # foo -> bar
    #   data =
    #     nodes:
    #       1: 'foo'
    #       2: 'bar'
    #     edges:
    #       3: [1, 2]

    #   graph = new IperGraph(data)
    #  graph.should.be.instanceOf IperGraph

    #  # This is a loop graph
    #  # foo -> foo
    #  data =
    #    nodes:
    #      1: 'foo'
    #    edges:
    #      2: [1, 1]

    #  graph = new IperGraph(data)
    #  graph.should.be.instanceOf IperGraph

    #  # This is a simple hypergraph
    #  # foo -> bar -> quz
    #  data =
    #    nodes:
    #      1: 'foo'
    #      2: 'bar'
    #      3: 'quz'
    #    edges:
    #      4: [1, 2, 3]

    #  graph = new IperGraph(data)
    #  graph.should.be.instanceOf IperGraph

    #it 'checks data is valid', ->

      # edges without nodes does not make sense
      data =
        edges:
          1: [5, 6]
          2: [3, 4]
*/

