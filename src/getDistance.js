
/**
 * The distance between two vertices in a graph is the number of edges in a shortest path (also called a graph geodesic) connecting them.
 *
 * http://en.wikipedia.org/wiki/Distance_(graph_theory)
 *
 * @returns {Number} distance
 */

function getDistance (nodeId1, nodeId2) {
  var distance = -1

  if (nodeId1 === nodeId2)
    distance = 0

  var edges = this.edges

  // TODO
  //
  return distance
}

module.exports = getDistance
