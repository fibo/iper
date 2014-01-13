
//
// # Create nodes
//

var iper = require('iper')
  , should = require('should');

var IperGraph = iper.IperGraph;

//
// Create an empty graph, and create a node
//

var graph = new IperGraph();
graph.createNode();

//
// Every node will be given a unique identifier, that is returned by #createNode() as a convenience.
// Lets create two nodes and store ids to use them later.
//

var id1 = graph.createNode([]);
var id2 = graph.createNode([]);

//
// Now we can use id1 and id2 to refer to the nodes,
// for example we can create an edge joining the nodes.
//

graph.createEdge([id1, id2]);


// We can also get a reference to the node
var node1 = graph.getNode(id1);

/*
// node1.data is an array, so we can push something in it
node1.data.push('foo');

// we can ask the degree of the node, that is the number of edges it has
node1.degree.should.be.eql(1);

// It is possible to set a #maxDegree when creating a node
var id3 = graph.createNode('example', {maxDegree:2});

// node3 will have at most 2 edges
var node3 = graph.getNode(id3);

// by the way, since we are working with hypergraphs,
// edges can join more than 2 nodes
graph.createEdge([id1, id2, id3]);
node3.degree.should.be.eql(1);

// Let' s add another edge to node3, it should be the last
graph.createEdge([id1, id3]);
node3.degree.should.be.eql(2);

// adding another edge should not be possible
(function () {
  graph.createEdge([id2, id3]);
}).should.throwError();

// node3 degree is unchanged
node3.degree.should.be.eql(2);

*/

