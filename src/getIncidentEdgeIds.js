/**
 * Edges incident to given node
 *
 * @param {Array} edges
 * @param {String} nodeId
 * @returns {Array} incidentEdgeIds
 */

const getIncidentEdgeIds = (edges, nodeId) => {
  let incidentEdgeIds = []

  const pushUniqueIncidents = (edgeId, nodeId, id) => {
    let isIncident = (id === nodeId)
    let isUnique = (incidentEdgeIds.indexOf(edgeId) < 0)

    if (isIncident && isUnique) {
      incidentEdgeIds.push(edgeId)
    }
  }

  for (let edgeId in edges) {
    let edge = edges[edgeId]

    edge.forEach(pushUniqueIncidents.bind(null, edgeId, nodeId))
  }

  return incidentEdgeIds
}

module.exports = getIncidentEdgeIds
