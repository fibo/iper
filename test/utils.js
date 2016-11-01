require('strict-mode')(() => {
  exports.getAdjacentNodeIds = require('../src/getAdjacentNodeIds')
  exports.getDegree = require('../src/getDegree')
  exports.getIncidentEdgeIds = require('../src/getIncidentEdgeIds')
  exports.getOrphanEdgeIds = require('../src/getOrphanEdgeIds')
  exports.getRank = require('../src/getRank')
})
