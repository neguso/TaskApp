var jwt = require('jwt-simple');

var config = require('../config.js'),
		errors = require('./errors.js'),
		valuestore = require('../modules/valuestore'),
		database = require('../modules/database'),
		logger = require('../modules/logger');


module.exports = function(req, res, next)
{
  var token = (req.body && req.body.x_access_token) || (req.query && req.query.x_access_token) || req.header('X-Access-Token');

	if(token)
	{
		valuestore.session.open().then((client) => {

			// look for session
			client.hgetall(token + ':auth', (err, info) => {
				if(err) return next(new errors.Internal(err.message));

				// info = { user: <objectid> }

				if(info === null)
				{
					// token not found in session //

					database.main.open().then((connection) => {

						// look for persisted token
						
						database.main.tokens.findOne({ token: token }, 'user', { lean: true })
							.populate({ path: 'user', select: 'email firstname lastname', options: { lean: true } })
							.exec((err, doc) => {
							if(err) return next(new errors.Internal(err.message));

							if(doc === null) return next(new errors.Unauthorized('Invalid token'));

							// create session
							var batch = client.batch();
							batch.hmset(token + ':auth', { user: doc.user._id.toString() });
							batch.expire(token + ':auth', 1800);
							batch.exec((err, results) => {
								if(err) return next(new errors.Internal(err.message));

								// init user, session
								req.user = new User(doc.user._id.toString());
								req.session = new Session(token, client);

								next();

								logger.info('new session created');
							});							
							
						});

					}, (err) => {
						// database error
						next(new errors.Internal(err.message));
					});
				}
				else
				{
					// token found in session //

					// init user, session
					req.user = new User(info.user);
					req.session = new Session(token, client);

					// update session expiration, don't wait for answer
					client.expire(token + ':auth', 30 * 60, (err, result) => {
						if(err) logger.warning('error updating key expiration: %s', err.message);
					});

					next();

					logger.info('existing session extended');
				}
			});

		}, (err) => {
			// session error
			next(new errors.Internal(err.message));
		});
	}
	else
	{
		// token not present in request
		next(new errors.Unauthorized('Token not supplied'));
	}
};


function User(id)
{
	this.id = id;
}

User.prototype.id = null;


function Session(token, storage)
{
	this.token = token;
	this.storage = storage;

	this.key = this.token + ':session';
}

Session.prototype.token = null;
Session.prototype.storage = null;

Session.prototype.set = function(field, value, callback)
{
	this.storage.hset(this.key, field, value, (err, result) => {
		if(err) return callback(err);
		callback(null, result);
	});
};

Session.prototype.get = function(field, callback)
{
	this.storage.hget(this.key, field, (err, value) => {
		if(err) callback(err);
		callback(null, value);
	});
};
