
var should = require('should')

var getOrphanEdgeIds = require('..').getOrphanEdgeIds

var graph1 = require('./examples/graphs/graph1.json')
  , orphanEdges1 = require('./examples/graphs/orphanEdges1.json')
  , orphanEdges2 = require('./examples/graphs/orphanEdges2.json')

describe('getOrphanEdgeIds', () => {
  it('returns orphan edges', () => {
    getOrphanEdgeIds.bind(orphanEdges1)().should.be.eql(['0'])

    getOrphanEdgeIds.bind(orphanEdges2)().should.be.eql(['3', '6'])
  })

  it('returns an empty array if there is no orphan edge', () => {
    getOrphanEdgeIds.bind(graph1)().should.be.eql([])
  })
})

