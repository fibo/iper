
//
// # IperElement
//
// Base class for every graph element.
//

var _ = require('underscore')

function IperElement (graph) {

  //
  // ## Attributes
  //

  //
  // ### graph
  //
  // References the graph containing the element.
  //
  // It is a <span class="label label-info">read only</span> attribute.
  //

  Object.defineProperty(this, 'graph', {value: graph, writable: false})

  //
  // ### id
  //
  // Every IperElement has a unique id.
  //
  // It is a <span class="label label-info">read only</span> attribute.
  //

  Object.defineProperty(this, 'id', {value: _.uniqueId(), writable: false})
}

module.exports = IperElement

