
_ = require 'underscore'

iper = require '../index'

IperNode = iper.IperNode

describe 'IperNode', ->
  describe 'constructor', ->
    it 'has signature (data)', ->
      data = 1
      node = new IperNode(data)
      node.should.be.instanceOf IperNode

    it 'has signature (data, check)', ->
      check = _.isArray
      data = [1, 2, 3]

      node = new IperNode(data, check)
      node.should.be.instanceOf IperNode

      it 'requires `check` to be a function', ->
      (() ->
        node = new IperNode({}, 'not a function')
      ).should.throwError()

