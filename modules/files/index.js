var fs = require('fs'),
		path = require('path');

var config = require('../../config.js'),
		database = require('../database');


function FileStorage(configuration)
{
	// configuration: { folder: 'path', keysize: 10 }
	this.configuration = configuration; 
}

FileStorage.prototype.configuration = null; 

FileStorage.prototype.store = function(id, data, callback)
{
	var file = path.join(this.configuration.folder, id);
	fs.writeFile(file, data, function(err) {
		if(err) return callback(err);
		callback(null, file);
	});
};

FileStorage.prototype.load = function(id, encoding, callback)
{
	var file = path.join(this.configuration.folder, id);
	fs.readFile(file, encoding, function(err, data) {
		if(err) return callback(err);
		callback(null, data);
	});
};

FileStorage.prototype.delete = function(ids, callback)
{
	var ary = new Array();
	ids.forEach((id) => {

		ary.push(new Promise((resolve, reject) => {
			var file = path.join(this.configuration.folder, id);
			fs.unlink(file, function(err) {
				resolve(err);
			});
		}));

	});

	Promise.all(ary).then((result) => {
		callback(null, result);
	});
};


module.exports = {
	
	attachments: new FileStorage({ folder: config.files.location, keysize: 10 })
	
};
