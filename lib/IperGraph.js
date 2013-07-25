
function IperGraph() {
  var edges = []
    , nodes = []

  this.__defineGetter__('edges', function () { return edges })
  this.__defineGetter__('nodes', function () { return nodes })
}

function pushNode() {

}
IperGraph.prototype.pushNode = pushNode

function deleteNode() {

}
IperGraph.prototype.deleteNode = deleteNode

module.exports = IperGraph

