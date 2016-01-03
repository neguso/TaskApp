// web application

'use strict';

var express = require('express');

var config = require('./config.js'),
		logger = require('./library/logger.js'),
		database = require('./database');


var started = false;

module.exports = {
	
	start: function()
	{
		return new Promise((resolve, reject) => {

			if(started)
				return reject(new Error('Cannot start, server is already running.'));

			database.connection().then((mongoose) => {

				var app = express();
				setup(mongoose, app);

				var server;
				if(config.web.secure)
				{
					var options = {};
					server = require('https').createServer(options, app);
				}
				else
					server = require('http').createServer(app);

				server.listen(config.web.port, function() {
					started = true;
					logger.log('web server listening on port %s', this.address().port);
					resolve(app);
				});
				
				server.on('error', function(err) {
					logger.log('web server error - ' + err.message);
					reject(err);
				});
				
			},
			(err) => {
				logger.log('cannot start web server, database not available');
				reject(err);
			});

		});
	}

};


// setup routes
function setup(database, server)
{
	server.use('/public', express.static(__dirname + '/www/public'));
	
	server.get('/', function (req, res) {
		res.sendFile(__dirname + '/www/index.html');
	});
	
}
