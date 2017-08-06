/**
 * Edges incident to given node
 *
 * @param {Object} edges
 * @param {String} nodeId
 * @returns {Array} incidentEdgeIds
 */

const getIncidentEdgeIds = (edges, nodeId) => {
  let incidentEdgeIds = []

  const pushUniqueIncidents = (edgeId, nodeId, id) => {
    const isIncident = (id === nodeId)
    const isUnique = (incidentEdgeIds.indexOf(edgeId) < 0)

    if (isIncident && isUnique) {
      incidentEdgeIds.push(edgeId)
    }
  }

  for (const edgeId in edges) {
    const edge = edges[edgeId]

    edge.forEach(pushUniqueIncidents.bind(null, edgeId, nodeId))
  }

  return incidentEdgeIds
}

module.exports = getIncidentEdgeIds
