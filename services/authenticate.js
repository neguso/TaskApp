var jwt = require('jwt-simple');

var config = require('../config.js'),
		errors = require('./errors.js'),
		valuestore = require('../modules/valuestore');


module.exports = function(req, res, next)
{
  var encoded_token = (req.body && req.body.x_access_token) || (req.query && req.query.x_access_token) || req.header('X-Access-Token');

	if(encoded_token)
	{
		try
		{
			var decoded_token = jwt.decode(encoded_token, config.token.secret);
			// { expiration: <date>, token: <string> }
			
			if(decoded_token.expiration <= Date.now())
				return next(new errors.Unauthorized('Token expired'));

			valuestore.session.open().then((client) => {

				// get token
				client.hgetall(decoded_token.token, (err, info) => {
					if(err) return next(new errors.Internal(err.message));

					if(info.keys().length === 0)
						return next(new errors.Unauthorized('Invalid token'));

					// info ::= { user: <objectid> }

					// init user
					req.user = new User(info.user);
					// init session
					req.session = new Session(info.user, client); 

					next();
				});

			}, (err) => {
				// session error
				next(new errors.Internal(err.message));
			});

		}
		catch(error)
		{
			// error occured
			next(new errors.Internal(error.message));
		}
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


function Session(id, storage)
{
	this.storage = storage;
}

Session.prototype.storage = null;

Session.prototype.set = function(key, value, callback)
{
	this.storage.hset(this.id, key, value, (err, result) => {
		if(err) return callback(err);
		callback(null, result);
	});
};

Session.prototype.get = function(key, callback)
{
	this.storage.hget(this.id, key, (err, value) => {
		if(err) callback(err);
		callback(null, value);
	});
};
