
var nextId = 0

/**
 * Get unique identifier.
 *
 * @returns {String} nextId
 */

function uniqueId () {
  return ++nextId + ''
}

module.exports = uniqueId

