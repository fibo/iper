import {getDegree} from 'iper'

import graph1 from './examples/graphs/graph1.json'
import isolatedNode from './examples/graphs/isolatedNode.json'
import loop1 from './examples/graphs/loop1.json'

describe('getDegree', () => {
  it('returns number of incident edges', () => {
    let edges = graph1.edges
    getDegree('1').should.be.eql(1)
    getDegree('2').should.be.eql(1)
  })

  it('is 0 for isolated nodes', () => {
    let edges = isolatedNode.edges
    getDegree(edges, 'isolated').should.be.eql(0)
  })

  it('counts loops twice', () => {
    let edges = loop1.edges
    getDegree(edges, '0').should.be.eql(2)
  })
})
