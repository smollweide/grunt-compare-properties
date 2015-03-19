/*
 * grunt-compare-properties
 * https://github.com/smollweide/grunt-compare-properties
 *
 * Copyright (c) 2015 Simon Mollweide
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	var compareProperties = require('./lib/compareProperties.js').init(grunt);

	grunt.registerMultiTask('compare_properties', 'A grunt plugin to compare two property files and find changes which has been made.', function () {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options({
			ignoreValues: false
		});

		compareProperties.run({
			options: options
		});

	});

};
