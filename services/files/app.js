// files service / public interface

var path = require('path'),
		restify = require('restify');

var config = require('../../config.js'),
		logger = require('../../modules/logger'),
		files = require('./index.js');


function Service(configuration)
{
	this.configuration = configuration;
}

Service.prototype.configuration = null;

Service.prototype.start = function(callback)
{
	var server = restify.createServer();

	files.attachments.setup(server);


	server.get('/:key/:file', function(request, response, next) {

		var filename = request.params.key + path.extname(request.params.file);
		files.attachments.load(filename, null, (err, data) => {
			if(err)
			{
				response.send(new restify.NotFoundError('File not found.'));
				response.end();
				return;
			}

			response.header('Content-disposition', 'attachment; filename=' + request.params.file);
			response.end(data);
		});

		next();
	});

	server.listen(this.configuration.port, callback);
} 


var instance = new Service({ port: config.files.port });

instance.start();
