
/**
 * Compute edges which does not refer to existing nodeIds
 *
 * @param {Object} graph
 * @returns {Array} orphanEdgeIds
 */

function getOrphanEdgeIds () {
  var orphanEdgeIds = []

  var edges = this.edges
    , nodes = this.nodes

  for (var edgeId in edges) {
    var edge = edges[edgeId]

    function nodeIdsNotFound (nodeId) {
      return typeof nodes[nodeId] === 'undefined'
    }

    if (edge.filter(nodeIdsNotFound).length > 0)
      orphanEdgeIds.push(edgeId)
  }

  return orphanEdgeIds
}

module.exports = getOrphanEdgeIds

