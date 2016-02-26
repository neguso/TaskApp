// start all services.

'use strict';

var api = require('./api.js'),
		socket = require('./socket.js'),
		www = require('./www.js');

api.start().then((apiapp) => {

	socket.start().then((socketapp) => {
		
		www.start().then((webapp) => {
			
		}, (err) => {
			
		});
		
	}, (err) => {
		
	});

}, (err) => {
	
});