var frisby = require('frisby');

var server = 'http://localhost:9001';

frisby.create('register user')
	.post(server + '/accounts/register', {
		email: random(1, 20) + '@' + random(1, 20) + '.com',
		firstname: random(1, 32),
		lastname: random(1, 32)
	})
	.expectStatus(200)
	.expectJSON({
		status: 'success'
	})
	.toss();

frisby.create('register user, no lastname')
	.post(server + '/accounts/register', {
		email: random(1, 20) + '@' + random(1, 20) + '.com',
		firstname: random(1, 32)
	})
	.expectStatus(200)
	.expectJSON({
		status: 'success'
	})
	.toss();






function random(min, max)
{
	max = max || 10;
	min = min || max;
	var n = min + Math.floor(Math.random() * (max - min));
	var ary = new Array(n);
	var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	for(var i = 0; i < n; i++)
		ary[i] = chars.charAt(Math.floor(Math.random() * chars.length));
	return ary.join('');
}