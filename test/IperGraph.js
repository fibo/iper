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
  return describe('constructor', function() {
    return it('has signature ()', function() {
      var graph;
      graph = new IperGraph();
      return graph.should.be.instanceOf(IperGraph);
    });
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
    #  # invalid edge
    #  data =
    #    nodes:
    #      1: 'foo'
    #      2: 'bar'
    #    edges:
    #      3: [5, 6]

    #  (() ->
    #    graph = new IperGraph(data)
    #  ).should.throwError()

      # edges without nodes does not make sense
      data =
        edges:
          1: [5, 6]
          2: [3, 4]

  describe 'methods', ->
    graph = new IperGraph()

    id1 = null
    data1 = 'foo'

    describe '#createNode()', ->
      it 'has signature (data), returns nodeId', ->
        id1 = graph.createNode data1
        id1.should.be.defined

    describe '#readNode()', ->
      it 'has signature (id), returns nodeData', ->
        data = graph.readNode id1
        data.should.be.eql data1

    describe '#updateNode()', ->
      it 'has signature (id, data)', ->

    describe '#deleteNode()', ->

    describe '#createEdge()', ->

    describe '#readEdge()', ->

    describe '#updateEdge()', ->

    describe '#deleteEdge()', ->
*/

