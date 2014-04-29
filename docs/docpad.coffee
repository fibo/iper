# DocPad Configuration File
# http://docpad.org/docs/config

pkg = require('../package.json')

docpadConfig = {
  templateData: {
    pkg: pkg
    bootstrap: {
      cdn: '//netdna.bootstrapcdn.com/bootstrap/3.1.1'
    }
  }
}

module.exports = docpadConfig

