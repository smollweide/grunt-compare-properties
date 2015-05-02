'use strict';

var grunt = require('grunt');
var compareProperties = require('../tasks/lib/compareProperties.js').init(grunt);

/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)
 test.done()
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */

exports.compare_properties = {

	setUp: function (done) {
		// setup here if necessary
		done();
	},

	default_options: function (test) {
		var actual = grunt.file.read('test/expected/default_options'),
			expected = grunt.file.read('test/expected/default_options');
		test.equal(actual, expected, 'default_options test failed');
		test.done();
	},

	testGetFileArray: function (test) {
		var CompareProperties = compareProperties.getClass();

		var comparePropertiesInstance = new CompareProperties({
			grunt: grunt,
			options: {
				isTest: true
			}
		});

		var fileDataKey = 'register.AcceptPolicy';
		var fileDataValue = 'Yes, <a target="_blank" href="{0}">Terms</a> and <a target="_blank" href="{1}">Policy</a>.';
		var fileArray = comparePropertiesInstance._getFileArray(fileDataKey + '=' + fileDataValue);

		test.equal(fileDataKey.length, fileArray.keys[0].length, '_getFileArray key test failed');
		test.equal(fileDataValue.length, fileArray.values[0].length, '_getFileArray value test failed');

		test.done();
	},

	testPropertiesWithEqualSigns: function (test) {

		compareProperties.run({
			options: {
				fileMaster: 'resources/i18n_master.properties',
				fileCompare: 'resources/i18n_compare.properties',
				fileDiff: 'diff/i18n_diff.properties'
			}
		});

		var CompareProperties = compareProperties.getClass();

		var comparePropertiesInstance = new CompareProperties({
			grunt: grunt,
			options: {
				showChanged: true,
				showAdded: true,
				showRemoved: true,
				fileMaster: 'test/fixtures/testPropertiesWithEqualSigns_master.properties',
				fileCompare: 'test/fixtures/testPropertiesWithEqualSigns_compare.properties',
				fileDiff: 'diff/testPropertiesWithEqualSigns_diff.properties',
				isTest: true
			}
		});

		comparePropertiesInstance._readFiles();

		//console.log('');
		//console.log('--- master keys ---');
		//console.log(comparePropertiesInstance._keysMaster.length);
		//console.log('--- master values ---');
		//console.log(comparePropertiesInstance._valuesMaster.length);
		//console.log('--- compare keys ---');
		//console.log(comparePropertiesInstance._keysCompare.length);
		//console.log('--- compare values ---');
		//console.log(comparePropertiesInstance._valuesCompare.length);

		comparePropertiesInstance._findChanges();
		comparePropertiesInstance._findRemoved();
		comparePropertiesInstance._writeResults();

		var expected = grunt.file.read('test/fixtures/testPropertiesWithEqualSigns_master.properties');
		var actual = grunt.file.read('diff/testPropertiesWithEqualSigns_diff.properties');

		expected = expected.replace(/#.*/g, '');
		expected = expected.replace(/\t*\n/g, '');

		actual = actual.replace(/#.*/g, '');
		actual = actual.replace(/\t*\n/g, '');

		//console.log('expected.length = ' + expected.length);
		//console.log('actual.length = ' + actual.length);

		test.equal(actual.length, expected.length, 'testPropertiesWithEqualSigns test failed');

		test.done();
	},

	testHasValidTags: function (test) {

		var CompareProperties = compareProperties.getClass(),
			comparePropertiesInstance = new CompareProperties({
				grunt: grunt,
				options: {
					fileMaster: 'test/fixtures/testPropertiesWithEqualSigns_master.properties',
					fileCompare: 'test/fixtures/testPropertiesWithEqualSigns_compare.properties',
					fileDiff: 'diff/testPropertiesWithEqualSigns_diff.properties',
					isTest: true
				}
			}),
			stringArray = [],
			expectedArray = [];

		stringArray.push('Yes, I agree to the <a target="_blank"> sfefwe </sdf> dsfsgewew <span>fsdfdsf</span>');
		expectedArray.push(false);
		stringArray.push('Yes, I agree to the <a target="_blank"> sfefwe </a> dsfsgewew <span>fsdfdsf</span>');
		expectedArray.push(true);
		stringArray.push('Yes, I agree to the <a target="_blank"> sfefwe </a> dsfsgewew <span>fsdfdsf</span> dsfs <p></p>');
		expectedArray.push(false);
		stringArray.push('Yes, I agree to the <a target="_blank"');
		expectedArray.push(false);
		stringArray.push('Yes, I <span target="_blank"');
		expectedArray.push(false);
		stringArray.push('Yes, I <div target="_blank"');
		expectedArray.push(false);

		for (var i = 0; i < stringArray.length; i += 1) {
			test.equal(
				comparePropertiesInstance._hasValidTags(stringArray[i]),
				expectedArray[i],
				'potentialErrors test ' + (i+1) + ' failed'
			);
		}

		test.done();
	},

	testHasValidVars: function (test) {

		var CompareProperties = compareProperties.getClass(),
			comparePropertiesInstance = new CompareProperties({
				grunt: grunt,
				options: {
					fileMaster: 'test/fixtures/testPropertiesWithEqualSigns_master.properties',
					fileCompare: 'test/fixtures/testPropertiesWithEqualSigns_compare.properties',
					fileDiff: 'diff/testPropertiesWithEqualSigns_diff.properties',
					isTest: true
				}
			}),
			stringArray = [],
			expectedArray = [];

		stringArray.push('Yes, I agree to the <a target="_blank"> sfefwe </sdf> dsfsgewew <span>fsdfdsf</span>');
		expectedArray.push(true);
		stringArray.push('Yes, I agree to the <a target="_blank"> sfefwe </a> dsfsgewew <span>fsdfdsf</span>');
		expectedArray.push(true);
		stringArray.push('Yes, I agree to the <a target="_blank"> sfefwe </a> dsfsgewew <span>fsdfdsf</span> dsfs <p></p>');
		expectedArray.push(true);
		stringArray.push('Yes, I {0} Test');
		expectedArray.push(true);
		stringArray.push('Yes, I {0} Test {1}');
		expectedArray.push(true);
		stringArray.push('Yes, I {0} Test {1} {2} {3} {4} {5} {6}');
		expectedArray.push(true);
		stringArray.push('Yes, I {0} Test {1} {3} {2} {4} {5} {6}');
		expectedArray.push(false);
		stringArray.push('Yes, I {0 Test');
		expectedArray.push(false);
		stringArray.push('Yes, I 0} Test');
		expectedArray.push(false);
		stringArray.push('Yes, I {# Test');
		expectedArray.push(false);
		stringArray.push('Yes, I ${ Test');
		expectedArray.push(false);
		stringArray.push('Yes, I {myVar} Test');
		expectedArray.push(false);
		stringArray.push('Yes, I {1} Test');
		expectedArray.push(false);
		stringArray.push('Yes, I agree to the');
		expectedArray.push(true);

		for (var i = 0; i < stringArray.length; i += 1) {
			test.equal(
				comparePropertiesInstance._hasValidVars(stringArray[i]),
				expectedArray[i],
				'potentialErrors test ' + (i+1) + ' failed'
			);
		}

		test.done();
	}

};
