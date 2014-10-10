
/**
 * Compute adjacent nodes
 *
 * @param {String} nodeId
 * @returns {Array} adjacentNodeIds
 */

function getAdjacentNodeIds (nodeId) {
  var adjacentNodeIds = []

  var edges = this.edges

  for (var edgeId in edges) {
    var edge = edges[edgeId]

    // Nothing to do if edge does not contain nodeId.
    if (edge.indexOf(nodeId) === -1)
      continue

      function givenNodeId (id) {
        return id !== nodeId
      }

      function foundNodeIds (id) {
        return adjacentNodeIds.indexOf(id) === -1
      }

      // Take all nodeIds except given nodeId, avoid repetitions.
      var nodeIds = edge.filter(givenNodeId)
                        .filter(foundNodeIds)

      adjacentNodeIds = adjacentNodeIds.concat(nodeIds)
  }

  return adjacentNodeIds
}

module.exports = getAdjacentNodeIds

