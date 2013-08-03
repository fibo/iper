
//
// IperElement
//

var _ = require('underscore')

function IperElement() {
  var id = _.uniqueId()

  this.__defineGetter__('id', function () { return id })
}

module.exports = IperElement

