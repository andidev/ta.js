'use strict';
/* global module:false */
/* jshint indent:2 */
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: [
      '/*!',
      ' * <%= pkg.name %> <%= pkg.version %>',
      ' * <%= pkg.homepage %>',
      ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>; Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>',
      ' */\n\n'
    ].join('\n'),
    // Task configuration.
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      gruntfile: ['Gruntfile.js'],
      src: ['src/**/*.js'],
      test: ['test/**/*.js']
    },
    jasmine : {
      src : 'src/**/*.js',
      options : {
        specs: 'test/**/*Spec.js'
      }
    },
    shell: {
      doxx: {
        command: 'doxx --source src --target docs  --template template.jade'
      }
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['src/*.js'],
        dest: 'dist/<%= pkg.name %>'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name.replace(".js", ".min.js") %>'
      }
    },
    watch: {
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['jshint:gruntfile']
      },
      src: {
        files: 'src/**/*.js',
        tasks: ['jshint:src', 'jasmine']
      },
      test: {
        files: 'test/**/*.js',
        tasks: ['jshint:test', 'jasmine']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('test', ['jshint', 'jasmine']);
  grunt.registerTask('default', ['jshint', 'jasmine', 'shell:doxx', 'concat', 'uglify']);

};
