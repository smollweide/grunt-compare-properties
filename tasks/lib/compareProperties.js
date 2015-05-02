/*
 * grunt-terrific-modules
 * https://github.com/smollweide/grunt-compare-properties
 *
 * Copyright (c) 2014 Simon Mollweide
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
		return CompareProperties.prototype;
	};

	exports.getClass = function () {
		return CompareProperties;
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
			removed: [],
			potentialErrorsMaster: [],
			potentialErrorsCompare: []
		};

		self._log('');

		if (self.options.isTest) {
			return this;
		}

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
			outputPotentialErrors = '',
			output,
			lenPotentialErrorMaster = self._changes.potentialErrorsMaster.length,
			lenPotentialErrorCompare = self._changes.potentialErrorsCompare.length,
			counter = 0;

		if (options.showChanged && self._changes.changed.length > 0) {

			outputChangedFrom += '\n';
			outputChangedFrom += '###########################\n';
			outputChangedFrom += '# CHANGED            	    #\n';
			outputChangedFrom += '###########################\n';

			self._for(self._changes.changed, function () {
				var item = this;
				counter += 1;
				outputChangedFrom += '#from: "' + item.value + '" to: "' + item.compareValue + '"\n';
				outputChangedFrom += item.key + '=' + item.compareValue + '\n';
			});

		}

		if (options.showAdded && self._changes.added.length > 0) {

			outputAdded += '\n';
			outputAdded += '###########################\n';
			outputAdded += '# ADDED                   #\n';
			outputAdded += '###########################\n';

			self._for(self._changes.added, function () {
				var item = this;
				counter += 1;
				outputAdded += item.key + '=' + item.value + '\n';
			});
		}

		if (options.showRemoved && self._changes.removed.length > 0) {

			outputRemoved += '\n';
			outputRemoved += '###########################\n';
			outputRemoved += '# REMOVED                 #\n';
			outputRemoved += '###########################\n';

			self._for(self._changes.removed, function () {
				var item = this;
				counter += 1;
				outputRemoved += item.key + '=' + item.value + '\n';
			});

		}

		if (options.showPotentialErrors) {

			if (lenPotentialErrorMaster > 0) {
				outputPotentialErrors += '\n';
				outputPotentialErrors += '###########################\n';
				outputPotentialErrors += '# POTENTIAL ERRORS MASTER #\n';
				outputPotentialErrors += '###########################\n';

				self._for(self._changes.potentialErrorsMaster, function () {
					var item = this;
					counter += 1;
					outputPotentialErrors += item.key + '=' + item.value + '\n';
				});
			}

			if (lenPotentialErrorCompare > 0) {
				outputPotentialErrors += '\n';
				outputPotentialErrors += '###########################\n';
				outputPotentialErrors += '# POTENTIAL ERRORS COMPARE#\n';
				outputPotentialErrors += '###########################\n';

				self._for(self._changes.potentialErrorsCompare, function () {
					var item = this;
					counter += 1;
					outputPotentialErrors += item.key + '=' + item.value + '\n';
				});
			}

		}

		output = outputPotentialErrors + outputRemoved + outputAdded + outputChangedFrom;

		self._log('found ' + counter + ' changes');
		if (options.showPotentialErrors) {
			var stringError = '';
			if ((lenPotentialErrorCompare + lenPotentialErrorMaster) > 0) {
				stringError = 'error';
			}
			self._log('found ' + (lenPotentialErrorCompare + lenPotentialErrorMaster) + ' potential errors', stringError);
		}
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

			if (self._hasPotentialError(value)) {
				self._changes.potentialErrorsCompare.push({
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

			if (self._hasPotentialError(value)) {
				self._changes.potentialErrorsMaster.push({
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
				keyVal = keyVal.slice(1, keyVal.length);
				fileObject.values.push(keyVal.join('='));
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

		if (!self._isValidString(options.fileMaster)) {
			self._log('- option "fileMaster" can\'t be empty!');
			return false;
		}

		if (!self._isValidString(options.fileCompare)) {
			self._log('- option "fileCompare" can\'t be empty!');
			return false;
		}

		if (!self._isValidString(options.fileDiff)) {
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

	_log: function (value, type) {
		var self = this;

		if (type === 'error') {
			self.grunt.log.error(value);
			return this;
		}

		self.grunt.log.writeln(value);
		return this;
	},

	_for: function (array, callback) {
		var i = 0,
			len = array.length
			;

		for (i; i < len; i += 1) {
			callback.call(array[i], i);
		}

	},

	_isValidString: function (value) {
		return (typeof(value) === 'string' && value !== '');
	},

	_hasPotentialError: function (value) {
		return !this._hasValidTags(value) || !this._hasValidVars(value);
	},

	_hasValidTags: function (value) {

		var self = this,
			tagPattern = /(<([^>]+)>)/ig,
			tagStartNamePattern = /(<)([a-zA-Z]*)/,
			tagEndNamePattern = /(<\/)([a-zA-Z]*)/,
			hasTag = value.search(/<[a-zA-Z]*/g) >= 0,
			tags, tag, tagsArray = [],
			i = 0, len, validTagCounter = 0;

		if (!hasTag) {
			return true;
		}

		tags = tagPattern.exec(value);

		if (tags === null) {
			self._log('not closing tag found in "' + value + '"', 'error');
			return false;
		}

		tagsArray.push({
			tag: tags[0],
			index: tags.index
		});

		if (tags[0].search(/\/>/) >= 0) {
			tagsArray.push({
				tag: tags[0].replace('/', '').replace('<', '</'),
				index: tags.index
			});
		}

		while((tag = tagPattern.exec(value)) !== null) {
			tagsArray.push({
				tag: tag[0],
				index: tag.index
			});

			if (tag[0].search(/\/>/) >= 0) {
				tagsArray.push({
					tag: tag[0].replace('/', '').replace('<', '</'),
					index: tag.index
				});
			}
		}

		len = tagsArray.length;

		if (len % 2 !== 0) {
			self._log('not closing tag found in "' + value + '"', 'error');
			return false;
		}

		for (i; i < len; i += 2) {

			var tagStart = tagsArray[i],
				tagEnd = tagsArray[i + 1];

			// start and end tag found
			if (tagStartNamePattern.exec(tagStart.tag)[2] === tagEndNamePattern.exec(tagEnd.tag)[2]) {

				//tag are empty
				if ((tagStart.index + tagStart.tag.length) === tagEnd.index) {
					self._log('empty tag found in "' + value + '"', 'error');
				} else {
					validTagCounter += 1;
				}
			} else {
				self._log('not closing tag found in "' + value + '"', 'error');
			}
		}

		return ((len / 2) === validTagCounter);
	},

	_hasValidVars: function (value) {

		var self = this,
			hasVar = value.search(/\{/g) >= 0,
			varPattern = /{(.*?)}/g,
			vars, _var,
			validCounter = 0,
			loopCounter = 0,
			sumLoopCounter;

		if (!hasVar) {
			if (value.search(/\}/g) >= 0) {
				self._log('not closing placeholder found in "' + value + '"', 'error');
				return false;
			}
			return true;
		}

		vars = varPattern.exec(value);

		if (vars === null) {
			self._log('not closing placeholder found in "' + value + '"', 'error');
			return false;
		}

		validCounter += parseInt(vars[1]);

		while((_var = varPattern.exec(value)) !== null) {
			validCounter += parseInt(_var[1]);
			loopCounter += 1;
		}

		sumLoopCounter = (Math.pow(loopCounter, 2) + loopCounter) / 2;

		if (sumLoopCounter !== validCounter) {
			self._log('using wrong parameters in "' + value + '"', 'error');
			return false;
		}

		return true;
	}

};
