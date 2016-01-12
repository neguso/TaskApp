var frisby = require('frisby');

var server = 'http://localhost:9001';

frisby.create('register: missing params')
	.post(server + '/accounts/register', {})
	.expectStatus(409)
	.expectJSON({
		code: 'Invalid Argument'
	})
	.toss();

frisby.create('register: invalid params')
	.post(server + '/accounts/register', {
		email: 'bad email',
		firstname: 'too long first name too long first name too long first name',
		lastname: ''
	})
	.expectStatus(409)
	.expectJSON({
		code: 'Invalid Argument'
	})
	.toss();

var email = random(1, 20) + '@domain.com';

frisby.create('register: ok')
	.post(server + '/accounts/register', {
		email: email,
		password: 'secret',
		firstname: random(1, 32)
	})
	.expectStatus(200)
	.expectJSON({
		status: 'success'
	})
	.toss();

frisby.create('register: duplicate email')
	.post(server + '/accounts/register', {
		email: email,
		password: 'secret',
		firstname: random(1, 32)
	})
	.expectStatus(200)
	.expectJSON({
		status: 'fail'
	})
	.toss();


var login = random(1, 5) + '@domain.com';

frisby.create('register for login')
	.post(server + '/accounts/register', {
		email: login,
		password: 'secret',
		firstname: 'Joe'
	})
	.expectStatus(200)
	.expectJSON({
		status: 'success'
	})
	.toss();

frisby.create('login')
	.post(server + '/accounts/login', {
		email: login,
		password: 'secret'
	})
	.expectStatus(200)
	.expectJSON({
		status: 'success'
	})
	.toss();

frisby.create('login & remember')
	.post(server + '/accounts/login', {
		email: login,
		password: 'secret',
		remember: true
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