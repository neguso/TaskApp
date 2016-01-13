// accounts service / implementation

var jwt = require('jwt-simple');

var database = require('../../modules/database'),
		valuestore = require('../../modules/valuestore/index.js'),
		validator = require('../../modules/validator'),
		errors = require('../errors.js');


module.exports = {

	// POST /accounts/register
	register: function(req, res, next)
	{
		var	email = validator.toString(req.body.email).trim(),
				password = validator.toString(req.body.password),
				firstname = validator.toString(req.body.firstname).trim(),
				lastname = (typeof req.body.lastname === 'undefined' ? req.body.lastname : validator.toString(req.body.lastname).trim());

		// validate email
		if(!validator.isEmail(email) || email.length === 0 || email.length > 128)
			return next(new errors.InvalidArgument('Invalid arguments'));

		// validate firstname
		if(firstname.length === 0 || firstname.length > 32)
			return next(new errors.InvalidArgument('Invalid arguments'));

		// validate lastname
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
				var user = { email: email, password: password, firstname: firstname };
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
		var email = validator.toString(req.body.email),
				password = validator.toString(req.body.password),
				persistent = validator.toBoolean(req.body.persistent);

		// validate email
		if(!validator.isEmail(email) || email.length === 0 || email.length > 128)
			return next(new errors.InvalidArgument('Invalid arguments'));

		database.main.open().then((connection) => {
			
			// check credentials
			database.main.users.findOne({ email: email, password: password }, 'email firstname lastname', { lean: true }, (err, user) => {
				if(err) return next(new errors.Internal(err.message));

				if(user === null)
				{
					res.json({ status: 'fail', reason: 'Invalid credentials' });
					res.end();
					return next();
				}

				if(persistent)
				{
					var token = maketoken(), expires = new Date(); expires.setDate(expires.getDate() + 14);

					// create token
					database.main.tokens.create({ token: token, user: user._id.toString(), expires: expires }, (err, newtoken) => {
						if(err) return next(new errors.Internal(err.message));

						valuestore.session.open().then((client) => {

							// create session
							var batch = client.batch();
							batch.hmset(token + ':auth', { user: user._id.toString() });
							batch.expire(token + ':auth', 1800);
							batch.exec((err, results) => {
								if(err) return next(new errors.Internal(err.message));

								res.json({
									status: 'success',
									token: token,
									expires: 1800,
									account: { email: user.email, firstname: user.firstname, lastname: user.lastname }
								});
								res.end();
								next();
							});

						}, (err) => {
							// session error
							next(new errors.Internal(err.message));
						});

					});
				}
				else
				{
					valuestore.session.open().then((client) => {

						var token = maketoken(), expires = new Date(); expires.setMinutes(expires.getMinutes() + 30);

						// create session
						var batch = client.batch();
						batch.hmset(token + ':auth', { user: user._id.toString() });
						batch.expire(token + ':auth', 30 * 60);
						batch.exec((err, results) => {
							if(err) return next(new errors.Internal(err.message));

							res.json({
								status: 'success',
								token: token,
								expires: expires,
								account: { email: user.email, firstname: user.firstname, lastname: user.lastname }
							});
							res.end();
							next();
						});

					}, (err) => {
						// session error
						next(new errors.Internal(err.message));
					});
				}

			});

		}, (err) => {
			// database error
			next(new errors.Internal(err.message));
		});
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
		res.send({ status: 'success' });
		res.end();

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


function maketoken()
{
	var ary = new Array(16);
	var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	for(var i = 0; i < ary.length; i++)
		ary[i] = chars.charAt(Math.floor(Math.random() * chars.length));
	return ary.join('');
}
