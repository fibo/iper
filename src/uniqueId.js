var nextId = 0

/**
 * Get unique identifier.
 *
 * @returns {String} nextId
 */

const uniqueId = () => {
  return ++nextId + ''
}

module.exports = uniqueId
