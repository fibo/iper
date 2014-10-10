
/**
 * Compute adjacent nodes
 *
 * @returns {Array} adjacentNodeIds
 */

function getAdjacentNodeIds (nodeId) {
  var adjacentNodeIds = []

/*
  // loop over all edges
  _.each(this.graph.edges, function (edge) {
    // if edge contains node
    if (_.contains(edge.nodeIds, id))
      // take all nodeIds except node self id
      adjacentNodeIds.push(_.without(edge.nodeIds, id))
  })

  // since _.without() return an array and nodeIds can be repeated,
  // use _.uniq() and _.flatten() to return a flat array with no repetition
  return _.uniq(_.flatten(adjacentNodeIds))
*/

  return adjacentNodeIds
}

module.exports = getAdjacentNodeIds

