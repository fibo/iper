import {getRank} from 'iper'

import graph1 from './examples/graphs/graph1.json'
import graph2 from './examples/graphs/graph2.json'

describe('getRank', () => {
  it('returns the maximum cardinality of the edges', () => {
    getRank(graph1.edges).should.be.eql(2)
    getRank(graph2.edges).should.be.eql(3)
  })
})
