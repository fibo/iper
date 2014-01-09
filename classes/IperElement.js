
//
// # IperElement
//
// Base class for *iper*.
//

var _ = require('underscore')

//
// ## Constructor
//
// Do not use *IperElement* directly, it is used internally by *iper* as a base class.
//
// If `this` refers to an *iper* class instance
//
// ```
// IperElement.call(this, graph)
// ```
//

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
    throw new Error()

  Object.defineProperty(this, 'graph', {value: graph, writable: false})

  //
  // ### id
  //
  // Every IperElement has a unique id.
  //

  Object.defineProperty(this, 'id', {value: _.uniqueId(), writable: false})
}

module.exports = IperElement

