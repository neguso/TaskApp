// accounts service / public interface

var express = require('express'),
		bodyparser = require('body-parser');

var config = require('../../config.js'),
		errors = require('../errors.js');


var app = express();

// install middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// handle authentication
app.all('/accounts/logout', require('../authenticate.js'));
app.all('/accounts/profile', require('../authenticate.js'));

// handle application logic
app.use('/accounts', require('./routes.js'));

// handle unknown routes
app.use((req, res, next) => {
	if(res.headersSent) return next();
	res.status(400);
	res.json({ code: 'Bad Request' });
	res.end();
	next();
});

// logging
app.use((req, res, next) => {
	console.log('%s %s [%s]', req.method, req.url, res.statusCode);
	next();
});

// handle exceptions 
app.use((err, req, res, next) => {
	if(res.headersSent) return next(err);
	if(err instanceof errors.HttpError)
	{
		res.status(err.status);
		res.json({ code: err.code, message: err.message });
		res.end();
	}
	else
	{
		res.status(500);
		res.json({ code: 'Unhandled Exception', message: err.message });
		res.end();
	}
	next(err);
});


var server = app.listen(config.accounts.port, () => {
  console.log('Accounts service listening on port ' + server.address().port);
});
