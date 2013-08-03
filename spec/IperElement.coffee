
iper = require '../index'

IperElement = iper.IperElement

describe 'IperElement', ->

  describe 'constructor', ->
    it 'has signature ()', ->
      element = new IperElement()
      element.should.be.instanceOf IperElement

  descrbe 'attributes', ->
    describe 'id', ->
