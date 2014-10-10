
/**
 * The degree of a vertex is the number of incident edges, with loops counted twice.
 * 
 * http://en.wikipedia.org/wiki/Degree_(graph_theory)
 * 
 * @param {String} nodeId
 * @returns {Number} degree
 */

function getDegree (nodeId) {
  var degree = 0

  var edges = this.edges

  function countIncidents (id) {
    if (id === nodeId)
      degree++
  }

  for (var edgeId in edges) {
    var edge = edges[edgeId]

    edge.forEach(countIncidents)
  }

  return degree
}

module.exports = getDegree

