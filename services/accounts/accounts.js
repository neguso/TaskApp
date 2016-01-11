// accounts service / implementation

var database = require('../../modules/database'),
		valuestore = require('../../modules/valuestore/index.js'),
		validator = require('../../modules/validator'),
		errors = require('../errors.js');


module.exports = {

	// POST /accounts/register
	register: function(req, res, next)
	{
		var	email = validator.toString(req.body.email).trim(),
				firstname = validator.toString(req.body.firstname).trim(),
				lastname = (typeof req.body.lastname === 'undefined' ? req.body.lastname : validator.toString(req.body.lastname).trim());

		// check email
		if(!validator.isEmail(email) || email.length === 0 || email.length > 128)
			return next(new errors.InvalidArgument('Invalid arguments'));

		// check firstname
		if(firstname.length === 0 || firstname.length > 32)
			return next(new errors.InvalidArgument('Invalid arguments'));

		// check lastname
		if(validator.isString(lastname) && (lastname.length > 32))
			return next(new errors.InvalidArgument('Invalid arguments'));


		database.main.open().then((connection) => {

			// check if e-mail is already registered
			database.main.users.count({ email: email }, (err, count) => {
				if(err) return next(new errors.Internal(err.message));

				if(count > 0)
				{
					res.json({ status: 'fail', reason: 'e-mail address already registered' });
					res.end();
					return next();
				}

				// create user
				var user = { email: email, firstname: firstname };
				if(validator.isString(lastname))
					user.lastname = lastname;
				database.main.users.create(user, (err, newUser) => {
					if(err) return next(new errors.Internal(err.message));

					res.json({ status: 'success' });
					res.end();
					next();
				});
			});

		}, (err) => {
			next(new errors.Internal(err.message));
		});
	},

	// POST /accounts/login
	login: function(req, res, next)
	{
		next();
	},

	// POST /accounts/logout
	logout: function(req, res, next)
	{
		next();
	},

	// GET /accounts/status
	getStatus: function(req, res, next)
	{
		next();
	},

	// GET /accounts/profile
	getProfile: function(req, res, next)
	{
		next();
	},

	// POST /accounts/profile
	updateProfile: function(req, res, next)
	{
		next();
	},

	// POST /accounts/invite
	invite: function(req, res, next)
	{
		next();
	}

};
