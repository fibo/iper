
// example dependencies

var iper = require('iper');
var should = require('should');

var IperGraph = iper.IperGraph;

module.exports = function () {

  var graph = new IperGraph();

  graph.should.be.instanceOf(IperGraph);

};
