'use strict';

var grunt = require('grunt');

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

exports.odata_load_feed = {
  setUp: function(done) {
    done();
  },
  default_options: function(test) {
    test.expect(1);
	let entityList = grunt.file.expand("./tmp/*.json");
	test.equal(entityList.length, 20, "Deirectory 'tmp' must be contain 20 json files");
    test.done();
  }
};
