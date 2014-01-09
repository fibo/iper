
var iper = require('../index')

describe("README's Quick start section", function () {
  it('has a working example', function () {

    var IperGraph = iper.IperGraph;

    var graph = new IperGraph();

    /*
    var fooNodeId = graph.createNode('foo');
    var barNodeId = graph.createNode(['bar']);
    var quzNodeId = graph.createNode({quz:'quuz'});

    var edgeId = graph.createEdge([fooNodeId, barNodeId]);
    var tripleEdgeId = graph.createEdge([fooNodeId, barNodeId, quzNodeId]);

    var data = {nodes:{},edges:{}}
    data.nodes[fooNodeId] = 'foo',
    data.nodes[barNodeId] = ['bar']
    data.nodes[quzNodeId] = {quz:'quuz'}

    data.edges[edgeId]       = [fooNodeId, barNodeId]
    data.edges[tripleEdgeId] = [fooNodeId, barNodeId, quzNodeId]

    graph.data.should.eql(data)
    */
  })
})

