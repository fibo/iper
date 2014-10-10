
var should = require('should')

var getOrphanEdgeIds = require('../src/getOrphanEdgeIds')

var graph1 = require('./examples/graphs/graph1.json')
  , orphanEdges1 = require('./examples/graphs/orphanEdges1.json')
  , orphanEdges2 = require('./examples/graphs/orphanEdges2.json')

describe('getOrphanEdgeIds', function () {
  it('returns orphan edges', function () {
    getOrphanEdgeIds.bind(orphanEdges1)().should.be.eql(['0'])

    getOrphanEdgeIds.bind(orphanEdges2)().should.be.eql(['3', '6'])
  })

  it('returns an empty array if there is no orphan edge', function () {
    getOrphanEdgeIds.bind(graph1)().should.be.eql([])
  })
})

