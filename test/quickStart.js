
var iper = require('../index.js');

var IperGraph = iper.IperGraph;

var graph = new IperGraph();

var fooNode = graph.createNode('foo');
var barNode = graph.createNode('bar');
var quzNode = graph.createNode('quz');

var tripleEdge = graph.createEdge([fooNode, barNode, quzNode])

