
var _ = require('underscore')

/**
 * Base class for *iper*.
 *
 * Do not use *IperElement* directly, it is used internally by *iper* as a base class.
 *
 * If `this` refers to an *iper* class instance
 *
 * ```
 * IperElement.call(this, graph)
 * ```
 *
 * @param {Object} graph
 */

function IperElement (graph) {

  //
  // ## Attributes
  //

  //
  // ### graph
  //
  // References the graph containing the element.
  //

  /* check graph */

  if (_.isUndefined(graph))
    throw new Error('graph is not defined')

  Object.defineProperty(this, 'graph', {
    enumerable: false,
    value: graph,
    writable: false
  })

  //
  // ### id
  //
  // Every IperElement has a unique id.
  //

  Object.defineProperty(this, 'id', {
    enumerable: true,
    value: _.uniqueId(),
    writable: false
  })
}

module.exports = IperElement

