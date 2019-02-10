/*
 * grunt-odata-load
 * https://github.com/chebotarev_sa/grunt-odata-load
 *
 * Copyright (c) 2019 Sergey A. Chebotarev
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    odata_load_feed: {
      northwind: {
          options: {
            url: "https://services.odata.org/V2/Northwind/Northwind.svc/",
            dest: "./tmp",
            feeds: ["*", "!C*"],
            mode: "clean"
          }
      }
	},

	odata_load_metadata: {
		northwind: {
			options: {
			  url: "https://services.odata.org/V2/Northwind/Northwind.svc/",
			  dest: "./tmp",
			}
		}
	},

	odata_call_function: {
		northwind: {
			options: {
			  url: "https://services.odata.org/v2/OData/OData.svc/",
			  dest: "./tmp",
			  importFunction: "GetProductsByRating",
			  type: "GET",
			  param: {
				rating:  10
			  }
			}
		}
	},

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'odata_load_metadata','odata_load_feed', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
