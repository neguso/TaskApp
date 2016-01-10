var jwt = require('jwt-simple');

var config = require('../config.js'),
		errors = require('./errors.js'),
		valuestore = require('../modules/valuestore/index.js');


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

				client.hgetall(decoded_token.token, (err, token) => {
					if(err) return next(new errors.Internal(error.message));

					if(token.keys().length === 0)
						return next(new errors.Unauthorized('Invalid token'));

					// decorate request
					req.user = new User(token);
					req.session = new Session(token); 
					// { user: <string> }

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


function User(token)
{
	
}

User.prototype.id = null;


function Session(token)
{
	
}

Session.prototype.set = function(key, value)
{
	
};

Session.prototype.get = function(key)
{
		
};
