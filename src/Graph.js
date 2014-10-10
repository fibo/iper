
/**
 * Hypergraph
 * @class
 *
 * http://en.wikipedia.org/wiki/Hypergraph
 *
 * @param {Object} graph
 */

function IperGraph () {
  var arg = arguments[0] || {}

  this.edges = arg.edges || {}
  this.nodes = arg.nodes || {}
}

module.exports = IperGraph

