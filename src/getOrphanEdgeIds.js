/**
 * Compute edges which does not refer to existing nodeIds
 *
 * @param {Array} edges
 * @param {Array} nodes
 * @param {Object} graph
 * @returns {Array} orphanEdgeIds
 */

const getOrphanEdgeIds = (edges, nodes) => {
  var orphanEdgeIds = []

  const nodeIdsNotFound = (nodeId) => {
    return typeof nodes[nodeId] === 'undefined'
  }

  for (var edgeId in edges) {
    var edge = edges[edgeId]

    if (edge.filter(nodeIdsNotFound).length > 0) {
      orphanEdgeIds.push(edgeId)
    }
  }

  return orphanEdgeIds
}

module.exports = getOrphanEdgeIds
