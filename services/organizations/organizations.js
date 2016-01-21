// organizations service / implementation

var database = require('../../modules/database'),
		valuestore = require('../../modules/valuestore/index.js'),
		util = require('../../modules/util'),
		errors = require('../errors.js');

var map = ['name:name', 'description:description'];

exports.organizations = {

	read: function(req, res, next)
	{
		var offset = req.query.offset,
				limit = req.query.limit,
				sort = req.query.sort,
				order = req.query.order,
				fields = util.validator.toString(req.query.fields).trim();

		// check params
		var ary = [];
		if(util.validator.isString(offset) && !util.validator.isInt(offset, { min: 0 })) ary.push('offset');
		if(util.validator.isString(limit) && !util.validator.isInt(limit, { min: 1, max: 100 })) ary.push('limit');
		if(util.validator.isString(sort) && !util.validator.isvalidfield(sort, map)) ary.push('sort');
		if(util.validator.isString(order) && ['asc', 'desc'].indexOf(order.toLowerCase()) === -1) ary.push('order');
		if(fields.length > 0 && util.parameter.getinvalidfields(fields.split(','), map).length > 0) ary.push('fields');
		if(ary.length > 0)
			return next(new errors.InvalidArgument(ary.join(',')));

		var datafields = util.parameter.getvalidfields(fields.split(','), map);
		if(datafields.length === 0)
			datafields.push('email', 'firstname', 'lastname');


	},

	get: function(req, res, next)
	{
		next();
	},

	create: function(req, res, next)
	{
		next();
	},

	update: function(req, res, next)
	{
		next();
	},

	delete: function(req, res, next)
	{
		next();
	}

};
