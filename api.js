// api service

'use strict';

var restify = require('restify');

var config = require('./config.js'),
		logger = require('./library/logger.js'),
		database = require('./database'),
		session = require('./session.js');


var started = false;

module.exports = {
	
	start: function()
	{
		return new Promise((resolve, reject) => {
		
			if(started)
				return reject(new Error('Cannot start, server is already running.'));

			database.connection().then((mongoose) => {

				session.connection().then((client) => {
					
					var app = restify.createServer();
					setup(mongoose, client, app);
					
					var server = app.listen(config.api.port, function() {
						started = true;
						logger.log('api server listening on port %s', this.address().port);
						resolve(app);
					});
					
					server.on('error', function(err) {
						logger.log('api server error - ' + err.message);
						reject(err);
					});			
					
				}, (err) => {
					logger.log('cannot start api server, session not available');
					reject(err);
				});
				
			},
			(err) => {
				logger.log('cannot start api server, database not available');
				reject(err);
			});

		});
	}

};


// setup routes
function setup(database, session, server)
{
	//todo
}
