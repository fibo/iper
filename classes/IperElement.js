
//
// # IperElement
//
// Base class for *iper*.
//

var _ = require('underscore')


function IperElement(graph) {

  //
  // ## Attributes
  //

  //
  // ### graph
  //

  /* TODO più che graph dovrei mettere parent, anche perchè qua non posso controllare che sia un IperGraph
   * inoltre posso fare che se parent è null, è una root 
   *
   * L' unica cosa + che parent mi sa che è riservato 
   * */
  function getGraph() { return graph }

  Object.defineProperty(this, 'graph', {get: getGraph})

  //
  // ### id
  //
  // Every IperElement has a unique id.
  //

  var id = _.uniqueId()

  function getId() { return id }

  Object.defineProperty(this, 'id', {get: getId})
}

module.exports = IperElement

