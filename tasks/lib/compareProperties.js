/*
 * grunt-terrific-modules
 * https://github.com/smollweide/grunt-terrific-modules
 *
 * Copyright (c) 2014 Jan Widmer, Simon Mollweide
 * Licensed under the MIT license.
 */

'use strict';

exports.init = function (grunt) {

	var exports = {},
		compareProperties;

	exports.run = function (options) {
		compareProperties = new CompareProperties({
			grunt: grunt,
			options: options.options
		});
	};

	exports.getPrototype = function () {
		return compareProperties.prototype;
	};

	exports.getClass = function () {
		return compareProperties;
	};

	return exports;
};


/**
 *
 * @class CompareProperties
 * @author Simon Mollweide
 * @namespace grunt
 * @param {object} options
 * @constructor
 *
 * generates a Module
 */
function CompareProperties(options) {
	this.init(options);
}

CompareProperties.prototype = {
	constructor : CompareProperties,

	/**
	 *
	 * @method init
	 * called by constructor
	 * @param {object} options
	 */
	init: function (options) {

		var self = this;

		self.grunt = options.grunt;
		self.options = options.options;

		self._log('');

		if (!self._isValidOptionsObject()) {
			return this;
		}

		if (!self._areFilesValid()) {
			return this;
		}

		return this;
	},

	_areFilesValid: function () {

		var self = this,
			options = self.options;

		if (!self._fileExist(options.fileMaster)) {
			self._log('- file "' + options.fileMaster + '" don\'t exist!');
			return false;
		}

		if (!self._fileExist(options.fileCompare)) {
			self._log('- file "' + options.fileCompare + '" don\'t exist!');
			return false;
		}

		return this;

	},

	_isValidOptionsObject: function () {

		var self = this,
			options = self.options;

		if (typeof(options.fileMaster) !== 'string' && options.fileMaster !== '') {
			self._log('- option "fileMaster" can\'t be empty!');
			return false;
		}

		if (typeof(options.fileCompare) !== 'string' && options.fileCompare !== '') {
			self._log('- option "fileCompare" can\'t be empty!');
			return false;
		}

		if (typeof(options.fileDiff) !== 'string' && options.fileDiff !== '') {
			self._log('- option "fileDiff" can\'t be empty!');
			return false;
		}

		return this;
	},

	_fileExist: function (path) {
		var self = this;
		return self.grunt.file.exists(path);
	},

	_fileRead: function (path) {
		var self = this;
		return self.grunt.file.read(path);
	},

	_fileWrite: function (path, value) {
		var self = this;
		self.grunt.file.write(path, value);
	},

	_log: function (value) {
		var self = this;
		self.grunt.log.writeln(value);
	}

};
