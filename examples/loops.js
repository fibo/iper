
//
// # Loops
//

var iper = require('iper');

var IperGraph = iper.IperGraph;

//
// Let's create a graph with one node
//

var graph = new IperGraph();
var nodeId = graph.createNode();

/* TODO degree counts loops */

//
// A loop is an edge that connects a node with itself
//

var edgeId1 = graph.createEdge([nodeId1, nodeId2]);

/* TODO var edgeId = node.createLoop(); */

