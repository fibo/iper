
module.exports = function () {

// example dependencies

var iper = require('iper');

var IperGraph = iper.IperGraph;

// Create an empty graph
var graph = new IperGraph();

// Use #createNode() to add nodes to the graph.
//
// For example, this will create an empty node.
graph.createNode();

  // You can pass any kind of data
  graph.createNode(0);
  graph.createNode('foo');
  graph.createNode(['bar']);
  graph.createNode({quz:'quuz'});
  graph.createNode(
    function hello() {
      console.log('Hello iper!');
    }
  );

  // Every node will be given a unique identifier, that is returned by #createNode() as a convenience.
  // Lets create two nodes with an empty array as data, 
  // and lets store ids to use them later.
  var id1 = graph.createNode([]);
  var id2 = graph.createNode([]);

  // Now we can use id1 and id2 to refer to the nodes,
  // for example we can create an edge joining the nodes.
  graph.createEdge([id1, id2]);

  // We can also get a reference to the node that is an object wrapping data
  var node1 = graph.getNode(id1);

  // node1.data is an array, so we can push something in it
  node1.data.push('foo');
};

