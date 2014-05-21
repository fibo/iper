
var _ = require('underscore')

/**
 * Base class
 *
 * * graph
 * * id
 *
 * @param {IperGraph} graph
 */

function IperElement (graph) {

  if (_.isUndefined(graph))
    throw new Error('graph is not defined')

  Object.defineProperty(this, 'graph', {
    enumerable: false,
    value: graph,
    writable: false
  })

  Object.defineProperty(this, 'id', {
    enumerable: true,
    value: _.uniqueId(),
    writable: false
  })
}

module.exports = IperElement

