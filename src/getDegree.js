/**
 * The degree of a vertex is the number of incident edges, with loops counted twice.
 *
 * http://en.wikipedia.org/wiki/Degree_(graph_theory)
 *
 * @param {Object} edges
 * @param {String} nodeId
 * @returns {Number} degree
 */

const getDegree = (edges, nodeId) => {
  let degree = 0

  const countIncidents = (id) => {
    if (id === nodeId) {
      degree++
    }
  }

  Object
    .values(edges)
    .forEach(edge => edge.forEach(countIncidents))

  return degree
}

module.exports = getDegree
