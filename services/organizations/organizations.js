// organizations service / implementation

var database = require('../../modules/database'),
		valuestore = require('../../modules/valuestore/index.js'),
		util = require('../../modules/util'),
		errors = require('../errors.js');

var map = ['name:name', 'description:description'];

exports.organizations = {

	read: function(req, res, next)
	{
		var map = util.mapper.create(['name', 'description']);

		var validator = util.validator.create();
		var offset = validator.optional(req.query.offset, 'offset').int().min(0).val(0);
		var limit = validator.optional(req.query.limit, 'limit').int().min(1).val(20);
		var sort = validator.optional(req.query.sort, 'sort').string().values(['name']).val('name');
		var order = validator.optional(req.query.order, 'order').string().values(['asc', 'desc']).val('asc');
		var fields = validator.optional(req.query.fields, 'fields').fields().values(map.public).val(['name', 'description']);
		if(validator.errors().length > 0)
			return next(new errors.InvalidArgument(validator.errors().join(',')));

		database.main.open().then((connection) => {

			database.main.organizationuserlinks
				.find({ user: req.user.id }, null, { skip: offset, limit: limit, lean: true })
				.populate({ path: 'organization', select: map.private.join(' '), options: { lean: true } })
				.exec((err, documents) => {
				if(err) return next(err);

				res.json(map.xxx(documents));
				res.end();
			});

		}, (err) => {
			// database error
			next(err);
		});
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
