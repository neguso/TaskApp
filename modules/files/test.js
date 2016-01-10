var files = require('./index.js'),
		assert = require('assert');


files.attachments.store('12345', 'file content', (err, file) => {
	assert.ifError(err);
	assert.equal(file, 'c:\\temp\\12345');
	
	files.attachments.load('12345', null, (err, data) => {
		assert.ifError(err);
		assert.equal(data, 'file content');
		
		files.attachments.delete(['12345'], (err, result) => {
			assert.ifError(err);
			assert.equal(result.length, 1);
			assert.equal(result[0], null);
			
			files.attachments.load('12345', null, (err, data) => {
				assert.notEqual(err, null);
			});
		});
	});
});
