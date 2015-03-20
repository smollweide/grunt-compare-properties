# grunt-compare-properties

> A grunt plugin to compare two property files and find changes which has been made.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-compare-properties --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-compare-properties');
```

## The "compare_properties" task

### Overview
In your project's Gruntfile, add a section named `compare_properties` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  compare_properties: {
   	i18n: {
		options: {
			fileMaster: 'resources/i18n_master.properties',
			fileCompare: 'resources/i18n_compare.properties',
			fileDiff: 'diff/i18n_diff.properties'
		}
	}
  },
});
```

### Options

#### options.fileMaster
Type: `String`

Path to the master file.

#### options.fileCompare
Type: `String`

Path to the file which you whant to compare.

#### options.fileDiff
Type: `String`

Path to the file which should be used to store the changes.

#### options.showRemoved
Type: `Boolean`
Default value: `true`

Defines whether the remove keys to be written in the "fileDiff" file.

#### options.showAdded
Type: `Boolean`
Default value: `true`

Defines whether the added keys to be written in the "fileDiff" file.

#### options.showChanged
Type: `Boolean`
Default value: `true`

Defines whether the changed values of the keys to be written in the "fileDiff" file.


## Release History
- 0.1.0 general functionality

License
=======

Copyright (c) 2015 Simon Mollweide

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

