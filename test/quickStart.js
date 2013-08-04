
var iper = require('../index')


describe("README's Quick start section", function () {
  it('has a working example', function () {

    var IperGraph = iper.IperGraph;
    var IperEdge  = iper.IperEdge;

    var graph = new IperGraph();

    var fooNodeId = graph.createNode('foo');
    var barNodeId = graph.createNode(['bar']);
    var quzNodeId = graph.createNode({quz:'quuz'});

    var edgeId = graph.createEdge([fooNodeId, barNodeId]);

    var edge = graph.getEdge(edgeId);
    edge.should.be.instanceOf(IperEdge)

/*
    var tripleEdgeId = graph.createEdge([fooNodeId, barNodeId, quzNodeId]);

    var tripleEdge = graph.getEdge(tripleEdgeId);
    tripleEdge.should.be.instanceOf(IperEdge)

    graph.data.should.eql({
      nodes:{
        fooNodeId: 'foo',
        barNodeId: ['bar'],
        quzNodeId: {quz:'quuz'}
      },
      edges: {
        edgeId: [fooNodeId, barNodeId],
        tripleEdgeId: [fooNodeId, barNodeId, quzNodeId]
      }
    })
*/
  })
})

