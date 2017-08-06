/**
  The rank is the maximum cardinality of any of the edges in the hypergraph
 *
 * @params {Object} edges
 * @returns {Number} rank
 */

const getRank = (edges) => {
  let rank = 0

  Object
    .values(edges)
    .forEach(edge => { rank = Math.max(rank, edge.length) })

  return rank
}

module.exports = getRank
