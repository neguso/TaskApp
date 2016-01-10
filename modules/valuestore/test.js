// tests & practices

var assert = require('assert'),
		valuestore = require('../valuestore');

valuestore.session.open().then((client) => {

	// set one value
	client.set('key', 'value', (err, result) => {
		if(err) return console.log('error setting one value');

		// get one value
		client.get('key', (err, value) => {
			if(err) return console.log('error getting one value');
			assert(value === 'value', 'unexpected value');
		});
	});

	// set multiple values
	client.mset(['key1', 'value1', 'key2', 'value2'], (err, result) => {
		if(err) return console.log('error setting multiple values');

		// get multiple values
		client.mget(['key1', 'key2'], (err, values) => {
			if(err) return console.log('error getting multiple values');
			assert(values[0] === 'value1' && values[1] === 'value2', 'unexpected value');
		});
	});


	// hash set one value
	client.hset('user:12345', 'token', 'abc', (err, result) => {
		if(err) return console.log('error setting hash field');

		// hash get one value
		client.hget('user:12345', 'token', (err, value) => {
			if(err) return console.log('error getting hash field');
			assert(value === 'abc', 'unexpected value');
		});
	});

	// hash set multiple values (1)
	client.hmset('user:1', ['token1', 'abc1', 'token2', 'abc2'], (err, result) => {
		if(err) return console.log('error setting hash fields (1)');

		// hash get multiple values
		client.hmget('user:1', ['token1', 'token2'], (err, values) => {
			if(err) return console.log('error getting hash fields (1)');
			assert(values[0] === 'abc1' && values[1] === 'abc2', 'unexpected value');
		});
	});

	// hash set multiple values (2)
	client.hmset('user:2', { token1: 'abc1', token2: 'abc2' }, (err, result) => {
		if(err) return console.log('error setting hash fields (2)');

		// hash get multiple values
		client.hgetall('user:2', (err, value) => {
			if(err) return console.log('error getting hash fields (2)');
			assert(value.token1 === 'abc1' && value.token2 === 'abc2', 'unexpected value');
		});
	});




}, (err) => {

});
