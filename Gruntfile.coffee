
classes = require('./classes')

templates =
  index: '../fibo.github.io/templates/index.jst'
  classes: '../fibo.github.io/templates/classes.jst'
  examples: '../fibo.github.io/templates/examples.jst'

livereloadPort = 35729

coffeeConfig = {}

for klass of classes
  do (klass) ->
    testPath = 'test/' + klass + '.js'
    specPath = 'spec/' + klass + '.coffee'

    testFromSpec = {}
    testFromSpec[testPath] = specPath

    coffeeConfig[klass] =
      files:
        testFromSpec

module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    watch:
      Gruntfile:
        files: ['Gruntfile.coffee']
        tasks: 'watch'

      coffee:
        files: ['spec/*.coffee']
        tasks: 'coffee'
      mochacli:
        files: ['test/*.js', 'classes/*.js']
        tasks: 'mochacli'
      docco:
        files: ['examples/*.js']
        tasks: 'docco'
      example:
        files: ['examples/*.js']
        tasks: ['mochacli:examples', 'docco']
      jshint:
        files: ['index.js', 'classes/*js']
        tasks: 'jshint'

    coffee: coffeeConfig

    connect:
      server:
        options:
          port: 3000
          livereload: livereloadPort
          base: 'docs'

    docco:
      examples:
        src: ['examples/*.js']
        options:
          template: templates.examples
          output: 'docs/examples'
      classes:
        src: ['classes/*.js']
        options:
          template: templates.classes
          output: 'docs/classes'

    jshint:
      options: grunt.file.readJSON('.jshintrc')
      classes:
        options:
          # W033:  Missing semicolon
          '-W033': true
        src: ['classes/*js']
      examples:
        src: ['examples/*js']

    markdown:
      index:
        files: [
          expand: true
          rename: (dest, src) ->
            return dest + '/index.html'
          src: 'README.md'
          dest: 'docs'
        ]
        options:
          template: templates.index
          templateContext:
            title: '<%= pkg.name %>'

    mochacli:
      options:
        require: ['should']
        reporter: 'spec'
        bail: true
      all: ['test/*.js']
      examples: ['test/examples.js']

    open:
      index:
        path: 'http://localhost:3000'
        app: 'chrome'

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-docco-multi'
  grunt.loadNpmTasks 'grunt-markdown'
  grunt.loadNpmTasks 'grunt-mocha-cli'
  grunt.loadNpmTasks 'grunt-open'

  grunt.registerTask 'default', ['jshint', 'coffee', 'mochacli', 'docs']
  grunt.registerTask 'docs', ['docco', 'markdown', 'connect', 'open', 'watch']

