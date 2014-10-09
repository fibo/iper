
var nextId = 0

function uniqueId () {
  return ++nextId
}

module.exports = uniqueId

