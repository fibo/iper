
//
// IperElement
// ===========
//

var _ = require('underscore')

// Constructor

function IperElement(graph) {

  // graph
  function getGraph() { return graph }

  Object.defineProperty(this, 'graph', {get: getGraph})

  // id
  var id = _.uniqueId()

  function getId() { return id }

  Object.defineProperty(this, 'id', {get: getId})
}

module.exports = IperElement

