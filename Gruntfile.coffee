module.exports = (grunt) ->
  grunt.initConfig
    watch:
      coffee:
        files: ['spec/*.coffee']
        tasks: 'coffee'
      mochacli:
        files: ['test/*.js', 'lib/*.js']
        tasks: 'mochacli'
    coffee:
      compile:
        options:
          bare: true
        expand: true
        cwd: 'spec'
        src: ['*.coffee']
        dest: 'test'
        ext: '.js'
    mochacli:
      options:
        require: ['should']
        reporter: 'spec'
        bail: true
      all: ['test/*.js']
        
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-mocha-cli'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.registerTask 'default', ['coffee', 'mochacli']

