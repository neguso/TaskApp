// organizations service / implementation

var database = require('../../modules/database'),
		valuestore = require('../../modules/valuestore/index.js'),
		util = require('../../modules/util'),
		errors = require('../errors.js');

var map = util.mapper.create(['id:_id', 'name', 'description']);

exports.organizations = {

	read: function(req, res, next)
	{
		var validator = util.validator.create();
		var poffset = validator.optional(req.query.offset, 'offset').int().min(0).val(0);
		var plimit = validator.optional(req.query.limit, 'limit').int().min(1).val(20);
		var psort = validator.optional(req.query.sort, 'sort').string().values(['name']).val('name');
		var porder = validator.optional(req.query.order, 'order').string().values(['asc', 'desc']).val('asc');
		var pfields = validator.optional(req.query.fields, 'fields').fields().values(map.public).val(['id', 'name']);
		if(validator.errors().length > 0)
			return next(new errors.InvalidArgument(validator.errors().join(',')));

		database.main.open().then((connection) => {

			var qsort = {};
			qsort[psort] = (porder === 'asc' ? 1 : -1);
			database.main.organizationuserlinks
				.find({ user: req.user.id }, 'organization', { skip: poffset, limit: plimit, sort: qsort, lean: true })
				.populate({ path: 'organization', select: pfields.join(' '), options: { lean: true } })
				.exec((err, documents) => {
				if(err) return next(err);

				database.main.organizationuserlinks.count({ user: req.user.id }, (err, count) => {
					if(err) return next(err);

					res.json({
						offset: poffset,
						total: count,
						items: map.decode(documents.map((item) => { return item.organization; }), pfields)
					});
					res.end();
				});
			});

		}, (err) => {
			// database error
			next(err);
		});
	},

	get: function(req, res, next)
	{
		var validator = util.validator.create();
		var pid = validator.required(req.params.id, 'id').string().length(24, 24).val();
		if(validator.errors().length > 0)
			return next(new errors.InvalidArgument(validator.errors().join(',')));

		database.main.open().then((connection) => {



		}, (err) => {
			// database error
			next(err);
		});
	},

	create: function(req, res, next)
	{
		var validator = util.validator.create();
		var pname = validator.required(req.body.name, 'name').string().length(1, 64).val();
		var pdescription = validator.optional(req.body.description, 'description').string().maxlength(512).val();
		if(validator.errors().length > 0)
			return next(new errors.InvalidArgument(validator.errors().join(',')));

		database.main.open().then((connection) => {

			// create organization
			var organization = {
				name: pname,
				description: pdescription
			};
			database.main.organizations.create(organization, (err, newOrganization) => {
				if(err) return next(err);

				// asign current user to organization as owner
				var link = {
					role: 'owner',
					organization: newOrganization.id,
					user: req.user.id
				};
				database.main.organizationuserlinks.create(link, (err, newLink) => {
					if(err) return next(err);

					res.json({ id: newOrganization.id });
					res.end();
				});
			});

		}, (err) => {
			// database error
			next(err);
		});
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
