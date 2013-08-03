
//
// IperNode
//

var _    = require('underscore')
  , util = require('util')

var IperElement = require('./IperElement')
  , IperGraph   = require('./IperGraph')

function IperNode(graph, data, check) {
  if (_.isUndefined(graph))
    throw new Error()

  //if (! (graph instanceof IperGraph))
  //  throw new Error()

  if (_.isUndefined(check))
    check = function dummy () {}

  if (_.isFunction(check))
    try { check(data) }
    catch (er) { throw er }
  else
    throw new Error()

  IperElement.call(this)

  this.__defineGetter__('data', function () { return data })
}

util.inherits(IperNode, IperElement)

module.exports = IperNode

