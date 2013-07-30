
var _ = require('underscore')

function IperNode(data, check) {
  if (check && typeof check !== 'function')
    throw new Error()

  var id = _.uniqueId()
  this.__defineGetter__('id', function () { return id })

  this.__defineGetter__('data', function () { return data })
}

module.exports = IperNode

