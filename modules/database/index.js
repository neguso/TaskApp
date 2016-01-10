'use strict';

var mongoose = require('mongoose');

var config = require('../../config.js'),
		logger = require('../logger');


function Database(configuration)
{
	this.configuration = configuration;

	this.connection = mongoose.createConnection();
	
	this.files = require('./models/file.js')(this.connection);
	this.messages = require('./models/message.js')(this.connection);
	this.journal = require('./models/journal.js')(this.connection);

	this.organizations = require('./models/organization.js')(this.connection);
	this.teams = require('./models/team.js')(this.connection);
	this.users = require('./models/user.js')(this.connection);
	this.organizationuserlinks = require('./models/organizationuserlink.js')(this.connection);
	this.teamuserlinks = require('./models/teamuserlink.js')(this.connection);

	this.projects = require('./models/project.js')(this.connection);
	this.projectuserlinks = require('./models/projectuserlink.js')(this.connection);
	this.tasks = require('./models/task.js')(this.connection);
	//this.activities = require('./models/activity.js')(this.connection);


	// setup logging
	this.connection.on('open', () =>
	{
		logger.log('connection to database server "mongodb://%s:%s/%s" successfully', this.connection.host, this.connection.port, this.connection.name);
	});
	this.connection.on('close', () =>
	{
		logger.log('connection to database server closed');
	});
	this.connection.on('reconnected', () =>
	{
		logger.log('connection to database server restored');
	});
	this.connection.on('error', (err) =>
	{
		logger.log('error connecting to database server - %s', err.message);
	});
}


// underlying connection
Database.prototype.connection = null;

// open connection
Database.prototype.open = function()
{
	var self = this;
	return new Promise((resolve, reject) => {

		switch(self.connection.readyState)
		{
			case 0: // disconnected
				self.connection.open(self.configuration.server, self.configuration.database, self.configuration.port, (err) => {
					if(err)
						return reject(err);
					
					resolve(self.connection);
				});
				break;

			case 1: // connected
				resolve(self.connection);
				break;
				
			case 2: // connecting
				self.connection.once('open', () =>
				{
					resolve(self.connection);
				});
				break;

			case 3: // disconnecting
				self.connection.once('close', () =>
				{
					self.connection.open(self.configuration.server, self.configuration.database, self.configuration.port, (err) => {
						if(err)
							return reject(err);
						
						resolve(self.connection);
					});
				});
				break;
		}

	});
};

// close connection
Database.prototype.close = function()
{
	var self = this;
	return new Promise((resolve, reject) => {

		switch(self.connection.readyState)
		{
			case 0: // disconnected
				resolve(self.connection);
				break;

			case 1: // connected
				self.connection.close(() => {
					resolve(self.connection);
				});
				break;
				
			case 2: // connecting
				self.connection.once('open', () =>
				{
					self.connection.close(() => {
						resolve(self.connection);
					});
				});
				break;

			case 3: // disconnecting
				self.connection.once('close', () =>
				{
					resolve(self.connection);
				});
				break;
		}
		
	});
};


module.exports = {

	main: new Database(config.mongodb)

};
