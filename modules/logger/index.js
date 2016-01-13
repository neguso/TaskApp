'use strict';

var	util = require('util'),
		process = require('process');

module.exports = {

	error: log,

	warning: log,

	info: log,

	log: log

};

function log()
{
	var now = new Date(), t = { y: now.getFullYear(), m: now.getMonth(), d: now.getDate(), h: now.getHours(), mi: now.getMinutes(), s: now.getSeconds(), ms: now.getMilliseconds() };
	var timestamp = util.format('[%s-%s-%s %s:%s:%s.%s]', t.y, pad2(t.m), pad2(t.d), pad2(t.h), pad2(t.mi), pad2(t.s), pad3(t.ms));

	arguments[0] = util.format('%s %d: ', timestamp, process.pid) + arguments[0];
	console.log.apply(this, arguments);
}

function pad2(n)
{
	return n < 10 ? '0' + n.toString() : n.toString();
}

function pad3(n)
{
	return n < 10 ? '00' + n.toString() : (n < 100 ? '0' + n.toString() : n.toString());
}
