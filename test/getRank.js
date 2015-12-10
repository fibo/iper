import {getRank} from 'iper'

import graph1 from './examples/graphs/graph1.json'
import graph2 from './examples/graphs/graph2.json'

const getRank1 = getRank.bind(graph1)
const getRank2 = getRank.bind(graph2)

describe('getRank', () => {
  it('returns the maximum cardinality of the edges', () => {
    getRank1().should.be.eql(2)
    getRank2().should.be.eql(3)
  })
})

