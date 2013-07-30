
iper = require '../index'

IperNode = iper.IperNode


describe 'IperNode', ->
  describe 'constructor', ->
    it 'has signature (data)', ->

    it 'has signature (data, checkData)', ->
      isArray = () -> return 'whatever'

      arrayNode = new IperNode([], isArray)
      arrayNode.should.be.instanceOf IperNode

    it 'requires checkData to be a function, if provided', ->
      (() ->
        node = new IperNode({}, 'not a function')
      ).should.throwError()

