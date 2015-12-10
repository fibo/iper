/**
  The rank is the maximum cardinality of any of the edges in the hypergraph
 *
 * @returns {Number} rank
 */

const getRank = () => {
  let rank = 0

  var edges = this.edges

  for (let edge of edges) {
    rank = Math.max(rank, edge.length)
  }

  return rank
}

module.exports = getRank
