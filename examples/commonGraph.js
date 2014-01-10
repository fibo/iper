
//
// # Common graph
//
// The common notion of graph is a undirected graph with rank 2.
// See [graph entry on wikipedia](http://en.wikipedia.org/wiki/Graph_(mathematics))
//

var iper = require('iper');

var IperGraph = iper.IperGraph;

//
// create a common graph
//

var graph = new IperGraph({}, {rank: 2});

