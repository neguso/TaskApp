var frisby = require('frisby'),
		files = require('./index.js');


frisby.create('file service test')
	.get('http://localhost:9000/12345')
	.expectStatus(200)
	.expectBodyContains('file content')
	.toss();



