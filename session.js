// session server

'use strict';

var redis = require('redis');

var config = require('./config.js'),
		logger = require('./library/logger.js');

var connected = false;

module.exports = {
	
	connection: function()
	{
		var client = null;
		
		return new Promise(function(resolve, reject) {
			
			if(connected)
				return resolve(client);

			client = redis.createClient({ host: config.redis.server, port: config.redis.port });

			client.on('connect', function() {
				connected = true;
				logger.log('connection to redis server "%s:%s" successfully', config.redis.server, config.redis.port);
				
				resolve(client);
			});

			client.on('end', function() {
				logger.log('connection to redis server closed');
			});
			
			client.on('error', function(err) {
				logger.log('error connecting to redis server - %s', err.message);
				
				reject(err);
			});
		});
	}
	
};
