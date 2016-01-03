// socket service

'use strict';

var http = require('http'),
		socket = require('socket.io');

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

				var app = http.createServer();
				var io = socket(app);
				setup(io);

				var server = app.listen(config.socket.port, function() {
					started = true;
					logger.log('socket server listening on port %s', this.address().port);
					resolve(io);
				});
				
				server.on('error', function(err) {
					logger.log('socket server error - ' + err.message);
					reject(err);
				});
				
			},
			(err) => {
				logger.log('cannot start socket server, database not available');
				reject(err);
			});

		});
	}
	
};


// setup messages
function setup(io)
{
	var subscribers = [];
	
	io.on('connection', (socket) => {
		logger.log('client connected');
		
		socket.on('subscribe', function(message) {
			if(subscribers.indexOf(this.id) === -1)
				subscribers.push(this.id);
		});

		socket.on('disconnect', function() {
			var i = subscribers.indexOf(this.id);
			if(i !== -1)
				subscribers.splice(i, 1);
			logger.log('client disconnected, subscribers: %d', subscribers.length);
		});
	});
	
	setInterval(function() {
			subscribers.forEach(function(subscriber) {
				io.to(subscriber).emit('project', 'there you go');
			}, this);	
		}, 2000);
}
