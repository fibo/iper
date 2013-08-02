module.exports = (grunt) ->
  grunt.initConfig
    watch:
      coffee:
        files: ['spec/*.coffee']
        tasks: 'coffee'
      mochacli:
        files: ['test/*.js', 'lib/*.js']
        tasks: 'mochacli'
      docco:
        files: ['index.js', 'lib/*.js']
        tasks: 'docco'
    coffee:
      compile:
        options:
          bare: true
        expand: true
        cwd: 'spec'
        src: ['*.coffee']
        dest: 'test'
        ext: '.js'
    docco:
      lib:
        src: ['index.js', 'lib/*.js']
        options:
          layout: 'classic'
          output: 'subtree/gh-pages/'
    mochacli:
      options:
        require: ['should']
        reporter: 'spec'
        bail: true
      all: ['test/*.js']

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-docco-multi'
  grunt.loadNpmTasks 'grunt-mocha-cli'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.registerTask 'default', ['coffee', 'mochacli']

