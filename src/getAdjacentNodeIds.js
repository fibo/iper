
/**
 * Compute adjacent nodes
 *
 * @param {Array} edges
 * @param {String} nodeId
 * @returns {Array} adjacentNodeIds
 */

const getAdjacentNodeIds = (edges, nodeId) => {
  let adjacentNodeIds = []

  const givenNodeId = (id) => {
    return id !== nodeId
  }

  const foundNodeIds = (id) => {
    return adjacentNodeIds.indexOf(id) === -1
  }

  for (let edgeId in edges) {
    let edge = edges[edgeId]

    // Nothing to do if edge does not contain nodeId.
    if (edge.indexOf(nodeId) === -1) {
      continue
    }

      // Take all nodeIds except given nodeId, avoid repetitions.
      let nodeIds = edge.filter(givenNodeId)
                        .filter(foundNodeIds)

      adjacentNodeIds = adjacentNodeIds.concat(nodeIds)
  }

  return adjacentNodeIds
}

module.exports = getAdjacentNodeIds
