// organizations service / implementation

var database = require('../../modules/database'),
		valuestore = require('../../modules/valuestore/index.js'),
		util = require('../../modules/util'),
		errors = require('../errors.js');


exports.organizations = {

	read: function(req, res, next)
	{
		var map = util.mapper.create(['id:organization._id', 'name:organization.name', 'description:organization.description', 'role']);
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
				.find({ user: req.user.id }, 'organization role', { skip: poffset, limit: plimit, sort: qsort, lean: true })
				.populate({ path: 'organization', select: pfields.join(' '), options: { lean: true } })
				.exec((err, documents) => {
				if(err) return next(err);

				database.main.organizationuserlinks.count({ user: req.user.id }, (err, count) => {
					if(err) return next(err);

					res.json({
						offset: poffset,
						total: count,
						items: map.decode(documents.map((item) => { return item; }), pfields)
					});
					res.end();
					next();
				});
			});

		}, (err) => {
			// database error
			next(err);
		});
	},

	get: function(req, res, next)
	{
		var map = util.mapper.create(['id:organization._id', 'name:organization.name', 'description:organization.description', 'role']);
		var validator = util.validator.create();
		var pid = validator.required(req.params.id, 'id').string().length(24).val();
		var pfields = validator.optional(req.query.fields, 'fields').fields().values(map.public).val(['id', 'name']);
		if(validator.errors().length > 0)
			return next(new errors.InvalidArgument(validator.errors().join(',')));

		database.main.open().then((connection) => {

			database.main.organizationuserlinks
				.findOne({ user: req.user.id, organization: pid }, 'organization role', { lean: true })
				.populate({ path: 'organization', select: pfields.join(' '), options: { lean: true } })
				.exec((err, document) => {
				if(err) return next(err);

				if(document === null)
					next(new errors.NotFound());
				else
				{
					res.json(map.decode(document, pfields));
					res.end();
					next();
				}
			});

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
					next();
				});
			});

		}, (err) => {
			// database error
			next(err);
		});
	},

	update: function(req, res, next)
	{
		var map = util.mapper.create(['name', 'description']);
		var validator = util.validator.create();
		var pid = validator.required(req.params.id, 'id').string().length(24).val();
		var pname = validator.optional(req.body.name, 'name').string().length(1, 64).val();
		var pdescription = validator.optional(req.body.description, 'description').string().maxlength(512).val();
		var pfields = validator.optional(req.query.fields, 'fields').fields().values(map.public).val(['id', 'name']);
		if(validator.errors().length > 0)
			return next(new errors.InvalidArgument(validator.errors().join(',')));

		database.main.open().then((connection) => {

			var update = map.encode({ name: pname, description: pdescription }, map.private);
			database.main.organizations.findOneAndUpdate({ _id: pid }, update, { new: true }, (err, updatedOrganization) => {
				if(err) return next(err);

				if(updatedOrganization === null)
					next(new errors.NotFound());
				else
				{
					res.json(map.decode(updatedOrganization, pfields));
					res.end();
					next();
				}
			});

		}, (err) => {
			// database error
			next(err);
		});
	},

	delete: function(req, res, next)
	{
		var validator = util.validator.create();
		var pid = validator.required(req.params.id, 'id').string().length(24).val();
		if(validator.errors().length > 0)
			return next(new errors.InvalidArgument(validator.errors().join(',')));

		database.main.open().then((connection) => {

			database.main.organizations.deleteById(pid, (err, numAffected) => {

				if(numAffected > 0)
				{
					res.json({ deleted: numAffected });
					res.end();
					next();
				}
				else
					next(new errors.NotFound());
			});

		}, (err) => {
			// database error
			next(err);
		});
	},


	readusers: function(req, res, next)
	{
		var map = util.mapper.create(['id:user._id', 'role', 'email:user.email', 'firstname:user.firstname', 'lastname:user.lastname']);
		var validator = util.validator.create();
		var pid = validator.required(req.params.id, 'id').string().length(24).val();
		var poffset = validator.optional(req.query.offset, 'offset').int().min(0).val(0);
		var plimit = validator.optional(req.query.limit, 'limit').int().min(1).val(20);
		var psort = validator.optional(req.query.sort, 'sort').string().values(['email', 'firstname', 'lastname']).val('email');
		var porder = validator.optional(req.query.order, 'order').string().values(['asc', 'desc']).val('asc');
		var pfields = validator.optional(req.query.fields, 'fields').fields().values(map.public).val(['id', 'email', 'firstname', 'lastname']);
		if(validator.errors().length > 0)
			return next(new errors.InvalidArgument(validator.errors().join(',')));

		database.main.open().then((connection) => {

			var qfilter = { organization: pid };
			var qsort = {};
			qsort[psort] = (porder === 'asc' ? 1 : -1);
			var userfields = map.private.filter((item, index) => { return pfields.indexOf(map.public[index]) !== -1 && item.startsWith('user.'); }).map((item) => { return item.substring(5); });
			database.main.organizationuserlinks
				.find(qfilter, 'role user', { skip: poffset, limit: plimit, sort: qsort, lean: true })
				.populate({ path: 'user', select: userfields.join(' '), options: { lean: true } })
				.exec((err, documents) => {
				if(err) return next(err);

				database.main.organizationuserlinks.count(qfilter, (err, count) => {
					if(err) return next(err);

					res.json({
						offset: poffset,
						total: count,
						items: map.decode(documents, pfields)
					});
					res.end();
					next();
				});
			});

		}, (err) => {
			// database error
			next(err);
		});
	},

	updateuser: function(req, res, next)
	{
		var map = util.mapper.create(['role', 'organization', 'user']);
		var validator = util.validator.create();
		var pid = validator.required(req.params.id, 'id').string().length(24).val();
		var puser = validator.required(req.params.user, 'user').string().length(24).val();
		var prole = validator.required(req.body.role, 'role').string().values(['owner', 'admin', 'member', 'guest']).val();
		if(validator.errors().length > 0)
			return next(new errors.InvalidArgument(validator.errors().join(',')));

		database.main.open().then((connection) => {

			var upsert = map.encode({ role: prole, organization: pid, user: puser }, map.private);
			database.main.organizationuserlinks.findOneAndUpdate({ organization: pid, user: puser }, upsert, { upsert: true, new: true }, (err, upsertOrganization) => {
				if(err) return next(err);

				res.json({ result: 'ok' });
				res.end();
				next();
			});

		}, (err) => {
			// database error
			next(err);
		});
	},

	deleteuser: function(req, res, next)
	{
		next();
	}
};
