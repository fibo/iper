import {getDegree} from 'iper'

import graph1 from './examples/graphs/graph1.json'
import isolatedNode from './examples/graphs/isolatedNode.json'
import loop1 from './examples/graphs/loop1.json'

const getDegree1 = getDegree.bind(graph1)
const getDegreeOfIsolatedNode = getDegree.bind(graph1)
const getDegreeOfLoop1 = getDegree.bind(loop1)

describe('getDegree', () => {
  it('returns number of incident edges', () => {
    getDegree1('1').should.be.eql(1)
    getDegree1('2').should.be.eql(1)
  })

  it('is 0 for isolated nodes', () => {
    getDegreeOfIsolatedNode('isolated').should.be.eql(0)
  })

  it('counts loops twice', () => {
    getDegreeOfLoop1('0').should.be.eql(2)
  })
})
