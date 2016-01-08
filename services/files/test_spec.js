var frisby = require('frisby'),
		files = require('./index.js');



frisby.create('file service test')
	.get('http://127.0.0.1:9000/omv6ilsnug/file.txt')
	.expectStatus(200)
	.expectBodyContains('file content')
	.toss();



