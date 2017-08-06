const no = require('not-defined')

/**
 * Compute edges which does not refer to existing nodeIds
 *
 * @param {Object} edges
 * @param {Object} nodes
 * @returns {Array} orphanEdgeIds
 */

const getOrphanEdgeIds = (edges, nodes) => {
  let orphanEdgeIds = []

  const nodeIdsNotFound = (nodeId) => (no(nodes[nodeId]))

  for (const edgeId in edges) {
    const edge = edges[edgeId]

    if (edge.filter(nodeIdsNotFound).length > 0) {
      orphanEdgeIds.push(edgeId)
    }
  }

  return orphanEdgeIds
}

module.exports = getOrphanEdgeIds
