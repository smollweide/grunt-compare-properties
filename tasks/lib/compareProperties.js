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
		self._findRemoved();
		self._writeResults();

		return this;
	},

	_writeResults: function () {

		var self = this,
			options = self.options,
			outputChangedFrom = '',
			outputAdded = '',
			outputRemoved = '',
			output,
			counter = 0;

		if (options.showChanged) {

			outputChangedFrom += '\n';
			outputChangedFrom += '###########################\n';
			outputChangedFrom += '# CHANGED            	    #\n';
			outputChangedFrom += '###########################\n';

			self._for(self._changes.changed, function () {
				var item = this;
				counter += 1;
				outputChangedFrom += '#from: "' + item.value + '" to: "' + item.compareValue + '"\n';
				outputChangedFrom += item.key + ' = ' + item.compareValue + '\n';
			});

		}

		if (options.showAdded) {

			outputAdded += '\n';
			outputAdded += '###########################\n';
			outputAdded += '# ADDED                   #\n';
			outputAdded += '###########################\n';

			self._for(self._changes.added, function () {
				var item = this;
				counter += 1;
				outputAdded += item.key + ' = ' + item.value + '\n';
			});

		}

		if (options.showRemoved) {

			outputRemoved += '\n';
			outputRemoved += '###########################\n';
			outputRemoved += '# REMOVED                 #\n';
			outputRemoved += '###########################\n';

			self._for(self._changes.removed, function () {
				var item = this;
				counter += 1;
				outputRemoved += item.key + ' = ' + item.value + '\n';
			});

		}

		output = outputRemoved + outputAdded + outputChangedFrom;

		self._log('found ' + counter + ' changes');
		self._fileWrite(options.fileDiff, output);
		self._log('file "' + options.fileDiff + '" written');
	},

	_findRemoved: function () {

		var self = this;

		self._for(self._keysCompare, function (index) {

			var key = this,
				value = self._valuesCompare[index];

			if (!(self._inArray(key, self._keysMaster) >= 0)) {
				self._changes.removed.push({
					key: key,
					value: value
				});
			}
		});

	},

	_findChanges: function () {

		var self = this;

		self._for(self._keysMaster, function (index) {

			var key = this,
				value = self._valuesMaster[index],
				inArrayNum = self._inArray(key, self._keysCompare);

			if (inArrayNum >= 0) {
				if (value !== self._valuesCompare[inArrayNum]) {
					self._changes.changed.push({
						key: key,
						value: value,
						compareValue: self._valuesCompare[inArrayNum]
					});
				}
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

			if (keyVal[0] !== '') {
				fileObject.keys.push(keyVal[0]);
				fileObject.values.push(keyVal[1]);
			}

		});

		return fileObject;
	},

	_cleanFile: function (fileData) {

		return fileData
			.replace(/\t/g, '')
			.replace(/^ /gm, '')
			.replace(/#.*/gm, '')
			.replace(/[ |\t]*=[ |\t]*/g, '=')
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

		var number = -1,
			i = 0,
			len = array.length
		;

		for (i; i < len; i += 1) {
			if (array[i] === value) {
				number = i;
				break;
			}
		}

		return number;
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
