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
		self._fileMaster = '';
		self._fileCompare = '';
		self._keysMaster = [];
		self._valuesMaster = [];
		self._keysCompare = [];
		self._valuesCompare = [];
		self._changes = {
			changed: [],
			added: [],
			removed: []
		};

		self._log('');

		if (!self._isValidOptionsObject()) {
			return this;
		}

		if (!self._areFilesValid()) {
			return this;
		}

		self._readFiles();
		self._findChanges();

		return this;
	},

	_findChanges: function () {

		var self = this;

		self._for(self._keysMaster, function (index) {

			var key = this,
				value = self._valuesMaster[index];

			if (self._inArray(key, self._keysCompare)) {
				self._changes.changed.push({
					key: key,
					value: value,
					compareValue: self._valuesCompare[index]
				});
			} else {
				self._changes.added.push({
					key: key,
					value: value
				});
			}
		});

	},

	_readFiles: function () {

		var self = this,
			options = self.options,
			arraysFileMaster,
			arraysFileCompare;

		self._fileMaster = self._fileRead(options.fileMaster);
		self._fileCompare = self._fileRead(options.fileCompare);

		arraysFileMaster = self._getFileArray(self._fileMaster);
		self._keysMaster = arraysFileMaster.keys;
		self._valuesMaster = arraysFileMaster.values;

		arraysFileCompare = self._getFileArray(self._fileCompare);
		self._keysCompare = arraysFileCompare.keys;
		self._valuesCompare = arraysFileCompare.values;

	},

	_getFileArray: function (fileData) {

		var self = this,
			fileObject = {
				keys: [],
				values: []
			},
			fileDataArray,
			fileDataClean = self._cleanFile(fileData);

		fileDataArray = fileDataClean.split('\n');

		self._for(fileDataArray, function () {
			var keyVal = this.split('=');

			fileObject.keys.push(keyVal[0]);
			fileObject.values.push(keyVal[1]);
		});

		return fileObject;
	},

	_cleanFile: function (fileData) {

		return fileData
			.replace(/\t/g, '')
			.replace(/^ /gm, '')
			.replace(/#.*/gm, '')
			.replace(/[ ]{0,1}=[ ]{0,1}/g, '=')
			.replace(/^\n/gm, '');

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

	_inArray: function (value, array) {

		var isInArray = false,
			i = 0,
			len = array.length
		;

		for (i; i < len; i += 1) {
			if (array[i] === value) {
				isInArray = true;
				break;
			}
		}

		return isInArray;
	},

	_log: function (value) {
		var self = this;
		self.grunt.log.writeln(value);
	},

	_for: function (array, callback) {
		var i = 0,
			len = array.length
			;

		for (i; i < len; i += 1) {
			callback.call(array[i], i);
		}

	}

};
