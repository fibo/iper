/**
 * Edges incident to given node
 *
 * @param {Object} edges
 * @param {String} nodeId
 * @returns {Array} incidentEdgeIds
 */

const getIncidentEdgeIds = (edges, nodeId) => {
  var incidentEdgeIds = []

  const pushUniqueIncidents = (edgeId, nodeId, id) => {
    var isIncident = (id === nodeId)
    var isUnique = (incidentEdgeIds.indexOf(edgeId) < 0)

    if (isIncident && isUnique) {
      incidentEdgeIds.push(edgeId)
    }
  }

  for (var edgeId in edges) {
    var edge = edges[edgeId]

    edge.forEach(pushUniqueIncidents.bind(null, edgeId, nodeId))
  }

  return incidentEdgeIds
}

module.exports = getIncidentEdgeIds
