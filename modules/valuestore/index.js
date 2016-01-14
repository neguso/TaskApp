'use strict';

var redis = require('redis');

var config = require('../../config.js'),
		logger = require('../logger');


function ValueStore(configuration)
{
	this.configuration = configuration;
}

ValueStore.prototype.client = null;

ValueStore.prototype.open = function()
{
	var self = this;
	return new Promise((resolve, reject) => {

		if(self.client !== null)
			return resolve(self.client);

		var client = redis.createClient({ host: self.configuration.server, port: self.configuration.port });

		client.on('connect', function() {
			logger.log('connection to redis server "%s:%s" successfully', self.configuration.server, self.configuration.port);
			self.client = client;
			resolve(self.client);
		});

		client.on('end', function() {
			logger.log('connection to redis server closed');
		});

		client.on('error', function(err) {
			logger.log('error connecting to redis server - %s', err.message);
			reject(err);
		});

	});
};

ValueStore.prototype.close = function()
{
	var self = this;
	return new Promise((resolve, reject) => {

		if(self.client === null)
			return resolve();

		self.client.quit();
		self.client = null;
		resolve();
	});
};


module.exports = {

	session: new ValueStore(config.redis)

};
