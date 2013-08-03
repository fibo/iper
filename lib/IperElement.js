
//
// IperElement
//

var _ = require('underscore')

function IperElement(graph) {

  this.__defineGetter__('graph', function () { return graph })

  var id = _.uniqueId()
  this.__defineGetter__('id', function () { return id })
}

module.exports = IperElement

