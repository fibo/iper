
/**
  The rank is the maximum cardinality of any of the edges in the hypergraph
 *
 * @returns {Number} rank
 */

function getRank () {
  var rank = 0

  var edges = this.edges

  for (var edgeId in edges) {
    var edge = edges[edgeId]

    rank = Math.max(rank, edge.length)
  }

  return rank
}

module.exports = getRank

