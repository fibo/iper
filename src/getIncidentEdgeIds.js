
/**
 * Edges incident to given node
 * 
 * @param {String} nodeId
 * @returns {Array} incidentEdgeIds
 */

function getIncidentEdgeIds (nodeId) {
  var incidentEdgeIds = []

  var edges = this.edges

  function pushUniqueIncidents (edgeId, nodeId, id) {
    var isIncident = (id === nodeId)
      , isUnique = (incidentEdgeIds.indexOf(edgeId) < 0)

    if (isIncident && isUnique)
      incidentEdgeIds.push(edgeId)
  }

  for (var edgeId in edges) {
    var edge = edges[edgeId]

    edge.forEach(pushUniqueIncidents.bind(null, edgeId, nodeId))
  }

  return incidentEdgeIds
}

module.exports = getIncidentEdgeIds

