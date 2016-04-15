// accounts service / implementation

var database = require('../../modules/database'),
		valuestore = require('../../modules/valuestore'),
		util = require('../../modules/util'),
		errors = require('../errors.js');

var map = ['email:email', 'firstname:firstname', 'lastname:lastname', 'avatar:avatar'];

module.exports = {

	// POST /accounts/register
	register: function(req, res, next)
	{
		var	email = req.body.email,
				password = req.body.password,
				firstname = req.body.firstname,
				lastname = req.body.lastname;

		// check params
		var ary = [];
		if(!util.validator.isEmail(email) || email.length === 0 || email.length > 128) ary.push('email');
		if(!util.validator.isString(password) || password.length === 0 || password.length > 20) ary.push('password');
		if(!util.validator.isString(firstname) || firstname.length === 0 || firstname.length > 32) ary.push('firstname');
		if(util.validator.isString(lastname) && (lastname.length > 32)) ary.push('lastname');
		if(ary.length > 0)
			return next(new errors.InvalidArgument(ary.join(',')));

		database.main.open().then((connection) => {

			// check if e-mail is already registered
			database.main.users.count({ email: email }, (err, count) => {
				if(err) return next(err);

				if(count > 0)
				{
					res.json({ error: 'DuplicateRecord' });
					res.end();
					return next();
				}

				// create user
				var user = {
					email: email,
					password: password,
					firstname: firstname,
					lastname: lastname
				};
				database.main.users.create(user, (err, createdUser) => {
					if(err) return next(err);

					res.json({ result: 'ok' });
					res.end();
					next();
				});
			});

		}, (err) => {
			next(err);
		});
	},

	// POST /accounts/login
	login: function(req, res, next)
	{
		var email = req.body.email,
				password = req.body.password,
				persistent = util.validator.toBoolean(req.body.persistent);

		// check params
		var ary = [];
		if(!util.validator.isEmail(email) || email.length === 0 || email.length > 128) ary.push('email');
		if(!util.validator.isString(password) || password.length === 0 || password.length > 20) ary.push('password');
		if(ary.length > 0)
			return next(new errors.InvalidArgument(ary.join(',')));

		database.main.open().then((connection) => {
			
			// check credentials
			database.main.users.findOne({ email: email, password: password }, 'email firstname lastname', { lean: true }, (err, user) => {
				if(err) return next(err);

				if(user === null)
				{
					res.json({ error: 'InvalidCredentials' });
					res.end();
					return next();
				}

				if(persistent)
				{
					var token = util.token.generate(), expires = new Date(); expires.setDate(expires.getDate() + 14);

					// create token
					database.main.tokens.create({ token: token, user: user._id.toString(), expires: expires }, (err, newtoken) => {
						if(err) return next(err);

						valuestore.session.open().then((client) => {

							// create session
							var batch = client.batch();
							batch.hmset(token + ':auth', { user: user._id.toString() });
							batch.expire(token + ':auth', 1800);
							batch.exec((err, results) => {
								if(err) return next(err);

								res.json({
									token: token,
									expires: 1800,
									user: { email: user.email, firstname: user.firstname, lastname: user.lastname }
								});
								res.end();
								next();
							});

						}, (err) => {
							// session error
							next(err);
						});

					});
				}
				else
				{
					valuestore.session.open().then((client) => {

						var token = util.token.generate(), expires = new Date(); expires.setSeconds(expires.getSeconds() + 1800);

						// create session
						var batch = client.batch();
						batch.hmset(token + ':auth', { user: user._id.toString() });
						batch.expire(token + ':auth', 1800);
						batch.exec((err, results) => {
							if(err) return next(err);

							res.json({
								token: token,
								expires: expires,
								user: { email: user.email, firstname: user.firstname, lastname: user.lastname }
							});
							res.end();
							next();
						});

					}, (err) => {
						// session error
						next(err);
					});
				}

			});

		}, (err) => {
			// database error
			next(err);
		});
	},

	// POST /accounts/logout
	logout: function(req, res, next)
	{
		database.main.open().then((connection) => {

			// remove persistent token
			database.main.tokens.remove({ token: req.session.token }, (err) => {
				if(err) return next(err);

				valuestore.session.open().then((client) => {

					// remove session
					client.del(req.session.token + ':auth', req.session.token + ':session', (err, results) => {
						if(err) return next(err);

						// clear req
						req.user = null;
						req.session = null;

						res.json({ result: 'ok' });
						res.end();
						next();
					});

				}, (err) => {
					// session error
					next(err);
				});				

			});

		}, (err) => {
			// database error
			next(err);
		});
	},

	// GET /accounts/status
	getStatus: function(req, res, next)
	{
		database.main.open().then((connection) => {

			database.main.tokens.findOne({ token: req.session.token }).populate({ path: 'user', select: 'email firstname lastname' }).exec((err, token) => {
				if(err) return next(err);

				if(token === null)
				{
					next(new errors.NotFound());
				}
				else
				{
					// update token ttl
					var expires = new Date(); expires.setDate(expires.getDate() + 14);
					token.expires = expires;
					token.save((err, doc, numAffected) => {
						if(err) return next(err);

						res.json({
							expires: expires,
							user: { email: token.user.email, firstname: token.user.firstname, lastname: token.user.lastname }
						});
						res.end();
						next();
					});
				}

			});

		}, (err) => {
			// database error
			next(err);
		});
	},

	// GET /accounts/profile
	getProfile: function(req, res, next)
	{
		var fields = util.validator.toString(req.query.fields).trim();

		// check params
		var ary = [];
		if(fields.length > 0 && util.parameter.getinvalidfields(fields.split(','), map).length > 0) ary.push('fields');
		if(ary.length > 0)
			return next(new errors.InvalidArgument(ary.join(',')));

		var userfields = util.parameter.getvalidfields(fields.split(','), map);
		if(userfields.length === 0)
			userfields.push('email', 'firstname', 'lastname');

		database.main.open().then((connection) => {

			database.main.users.findOne({ _id: req.user.id }, null, { lean: true }, (err, user) => {
				if(err) return next(err);

				if(user === null)
				{
					return next(new errors.NotFound());
				}
				else
				{
					res.json(util.parameter.exportfields(user, userfields, map));
					res.end();
					next();
				}
			});

		}, (err) => {
			// database error
			next(err);
		});
	},

	// POST /accounts/profile
	updateProfile: function(req, res, next)
	{
		var firstname = req.body.firstname,
				lastname = req.body.lastname,
				newpassword = req.body.newpassword,
				oldpassword = req.body.oldpassword;

		// check params
		var ary = [];
		if(util.validator.isString(firstname) && (firstname.length === 0 || firstname.length > 32)) ary.push('firstname');
		if(util.validator.isString(lastname) && (lastname.length === 0 || lastname.length > 32)) ary.push('lastname');
		if(util.validator.isString(newpassword) && (newpassword.length === 0 || newpassword.length > 20 || !util.password.isvalid(newpassword))) ary.push('newpassword');
		if(util.validator.isString(newpassword) !== util.validator.isString(oldpassword)) ary.push('oldpassword');
		if(ary.length > 0)
			return next(new errors.InvalidArgument(ary.join(',')));
		if(!util.validator.isString(firstname) && !util.validator.isString(lastname) && !util.validator.isString(newpassword))
			return next(new errors.InvalidArgument(''));

		database.main.open().then((connection) => {

			database.main.users.findById(req.user.id, (err, user) => {
				if(err) return next(err);

				if(user === null)
				{
					return next(new errors.NotFound());
				}
				else
				{
					if(typeof oldpassword !== 'undefined' && !util.password.equals(oldpassword, user.password))
					{
						res.json({ error: 'PasswordNotMatch' });
						res.end();
						next();
					}

					util.parameter.importfields(req.body, ['firstname', 'lastname'], map, user);
					if(util.validator.isString(newpassword))
						user.password = util.password.encrypt(newpassword);

					user.save((err, doc, numAffected) => {
						if(err) return next(err);
						
						if(numAffected === 0)
						{
							next(new errors.NotFound());
						}
						else
						{
							res.json({ result: 'ok' });
							res.end();
							next();
						}
					});
				}
			});

		}, (err) => {
			// database error
			next(err);
		});
	},

	// POST /accounts/invite
	invite: function(req, res, next)
	{
		throw new Error('Not implemented.');
	}

};
