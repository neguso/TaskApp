'use strict';

var mongoose = require('mongoose');

var config = require('../config.js'),
		logger = require('../library/logger.js');


function Database(configuration)
{
	this.configuration = configuration;

	this.connection = mongoose.createConnection();
	
	this.users = require('./models/user.js')(this.connection);
	//...
	
	// setup logging
	this.connection.on('open', () =>
	{
		logger.log('connection to database server "mongodb://%s:%s/%s" successfully', this.connection.host, this.connection.port, this.connection.name);
	});
	this.connection.on('close', () =>
	{
		logger.log('connection to database server closed');
	});
	this.connection.on('error', (err) =>
	{
		logger.log('error connecting to database server - %s', err.message);
	});
}

Database.prototype.connection = null;

Database.prototype.open = function()
{
	return new Promise((resolve, reject) => {

		switch(this.connection.readyState)
		{
			case 0: // disconnected
				this.connection.open(this.configuration.server, this.configuration.database, this.configuration.port, (err) => {
					if(err)
						return reject(err);
					
					resolve(this.connection);
				});
				break;

			case 1: // connected
				resolve(this.connection);
				break;
				
			case 2: // connecting
				this.connection.once('open', () =>
				{
					resolve(this.connection);
				});
				break;

			case 3: // disconnecting
				this.connection.once('close', () =>
				{
					this.connection.open(this.configuration.server, this.configuration.database, this.configuration.port, (err) => {
						if(err)
							return reject(err);
						
						resolve(this.connection);
					});
				});
				break;
		}

	});
};

Database.prototype.close = function()
{
	return new Promise((resolve, reject) => {

		switch(this.connection.readyState)
		{
			case 0: // disconnected
				resolve(this.connection);
				break;

			case 1: // connected
				this.connection.close(() => {
					resolve(this.connection);
				});
				break;
				
			case 2: // connecting
				this.connection.once('open', () =>
				{
					this.connection.close(() => {
						resolve(this.connection);
					});
				});
				break;

			case 3: // disconnecting
				this.connection.once('close', () =>
				{
					resolve(this.connection);
				});
				break;
		}
		
	});
};


module.exports = {

	main: new Database(config.mongodb)

};
