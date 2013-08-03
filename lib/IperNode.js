
//
// IperNode
//

var _    = require('underscore')
  , util = require('util')

var IperElement = require('./IperElement')

function IperNode(data, check) {

  if (arguments.length === 1)
    check = function dummy () {}

  if (_.isFunction(check))
    try {
      check(data)
    }
    catch (er) {
      throw er
    }
  else
    throw new Error()

  var id = _.uniqueId()

  this.__defineGetter__('id', function () { return id })

  this.__defineGetter__('data', function () { return data })
}

util.inherits(IperNode, IperElement)

module.exports = IperNode

