
describe('strict mode', function () {
  it('is on', function () {
    require('strict-mode')(function () {
      require('..')
    })
  })
})

