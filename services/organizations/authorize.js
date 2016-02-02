// organizations service / authorization

var database = require('../../modules/database'),
		util = require('../../modules/util'),
		errors = require('../errors.js');


exports.organizations = {

	update: function(req, res, next)
	{
		var validator = util.validator.create();
		var pid = validator.required(req.params.id, 'id').string().length(24).val();
		if(validator.errors().length > 0)
			return next(new errors.InvalidArgument(validator.errors().join(',')));

		database.main.open().then((connection) => {

			database.main.organizationuserlinks.findOne({ user: req.user.id, organization: pid }, 'role', { lean: true }, (err, document) => {
				if(err) return next(err);

				if(document === null || (document.role != 'owner' && document.role != 'admin'))
					next(new errors.Forbidden());
				else
					next();
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

			database.main.organizationuserlinks.findOne({ user: req.user.id, organization: pid }, 'role', { lean: true }, (err, document) => {
				if(err) return next(err);

				if(document === null || document.role != 'owner')
					next(new errors.Forbidden());
				else
					next();
			});

		}, (err) => {
			// database error
			next(err);
		});			
	}

};
