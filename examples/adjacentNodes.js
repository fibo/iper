
//
// # Adjacent nodes
//

var iper = require('iper');

var IperGraph = iper.IperGraph;

//
// Let's create an empty graph and add some nodes
//

var graph = new IperGraph();

/*
var id1, id2, id3, id4, id5
  , adjacentNodeIds;

id1 = graph.createNode();
id2 = graph.createNode();
id3 = graph.createNode();
id4 = graph.createNode();
id5 = graph.createNode();

// retrieve a reference to the first node
node1 = graph.getNode(id1);

// Two nodes are adjacents if there is an hyperedge that contains both of
// these nodes, so by now there is no adjacent node

adjacentNodeIds = node1.getAdjacentNodeIds();
// TODO adjacentNodeIds.should.be.empty();

// Now we can add some edges and check adjacentNodeIds
graph.createEdge([id1, id2]);
adjacentNodeIds = node1.getAdjacentNodeIds();
adjacentNodeIds.should.be.eql([id2]);

// adjacentNodeIds list is a list of uniq ids
// creating an edge with same endpoints than above should not
// change adjacentNodeIds list
graph.createEdge([id1, id2]);
adjacentNodeIds = node1.getAdjacentNodeIds();
adjacentNodeIds.should.be.eql([id2]);

// let's try with a 3-edge
graph.createEdge([id1, id3, id4]);
adjacentNodeIds = node1.getAdjacentNodeIds();
adjacentNodeIds.should.be.eql([id2, id3, id4]);

// this edge should not change adjacentNodeIds list, since id1 is not involved
graph.createEdge([id3, id4, id5]);
adjacentNodeIds = node1.getAdjacentNodeIds();
adjacentNodeIds.should.be.eql([id2, id3, id4]);

// let's try removing a node
graph.removeNode(id3);
adjacentNodeIds = node1.getAdjacentNodeIds();
adjacentNodeIds.should.be.eql([id2, id4]);

*/

