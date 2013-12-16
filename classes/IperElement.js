
//
// # IperElement
//
// Base class for *iper*.
//

var _ = require('underscore')


function IperElement (graph) {

  //
  // ## Attributes
  //

  //
  // ### graph
  //

  Object.defineProperty(this, 'graph', {value: graph, writable: false})

  //
  // ### id
  //
  // Every IperElement has a unique id.
  //

  Object.defineProperty(this, 'id', {value: _.uniqueId(), writable: false})
}

module.exports = IperElement

