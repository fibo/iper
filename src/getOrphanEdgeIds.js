/**
 * Compute edges which does not refer to existing nodeIds
 *
 * @param {Object} graph
 * @returns {Array} orphanEdgeIds
 */

const getOrphanEdgeIds = () => {
  let orphanEdgeIds = []

  var edges = this.edges
  var nodes = this.nodes

  const nodeIdsNotFound = (nodeId) => {
    return typeof nodes[nodeId] === 'undefined'
  }

  for (let edge of edges) {
    if (edge.filter(nodeIdsNotFound).length > 0) {
      orphanEdgeIds.push(edgeId)
    }
  }

  return orphanEdgeIds
}

module.exports = getOrphanEdgeIds
