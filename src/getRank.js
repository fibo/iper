/**
  The rank is the maximum cardinality of any of the edges in the hypergraph
 *
 * @params {Object} edges
 * @returns {Number} rank
 */

const getRank = (edges) => {
  var rank = 0

  for (var edgeId in edges) {
    var edge = edges[edgeId]
    rank = Math.max(rank, edge.length)
  }

  return rank
}

module.exports = getRank
