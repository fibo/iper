
var _ = require('underscore')

function IperNode(data) {
  var id = _.uniqueId()
  this.__defineGetter__('id', function () { return id })

  this.__defineGetter__('data', function () { return data })
}

module.exports = IperNode

