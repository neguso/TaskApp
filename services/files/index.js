// files service / implementation

var fs = require('fs'),
		path = require('path');

var config = require('../../config.js'),
		logger = require('../../modules/logger');


function FileStorage(configuration)
{
	this.configuration = configuration; 
}

FileStorage.prototype.configuration = null; 

FileStorage.prototype.store = function(data, extension, callback)
{
	var key = random();
	var file = path.join(this.configuration.folder, key + '.' + extension);

	fs.writeFile(file, data, function(err) {
		if(err) return callback(err);
		callback(null, key);
	});
};

FileStorage.prototype.load = function(filename, encoding, callback)
{
	var file = path.join(this.configuration.folder, filename);

	fs.readFile(file, encoding, function(err, data) {
		if(err)
		{
			if(err.code === 'ENOENT')
				return callback(null, null);
			return callback(err);
		}
		callback(null, data);
	});
};

FileStorage.prototype.delete = function(filenames, callback)
{
	var ary = new Array();
	filenames.forEach((file) => {

		ary.push(new Promise((resolve, reject) => {
			var file = path.join(this.configuration.folder, file);

			fs.unlink(file, function(err) {
				resolve(err);
			});
		}));

	});

	Promise.all(ary).then((result) => {
		callback(null, result);
	});
}



function RestService()
{
	
}

RestService.prototype.setup = function(server)
{
	server.use();
}



module.exports = {

	attachments: new RestService()

	//attachments: new FileStorage({ folder: config.files.location })

};


function random()
{
	var ary = new Array(10);
	var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	for(var i = 0; i < 10; i++)
		ary[i] = chars.charAt(Math.floor(Math.random() * chars.length));
	return ary.join('');
}
