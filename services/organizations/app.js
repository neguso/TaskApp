// organizations service / public interface

var express = require('express');

var	config = require('../../config.js'),
		errors = require('../errors.js');


var app = express();
app.set('x-powered-by', false);

// install middleware
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('../monitor.js').performance());
app.use(require('../monitor.js').logging());

// handle authentication
app.all('/*', require('../authenticate.js'));

// handle application logic
app.use('/', require('./routes.js'));

// handle unknown routes
app.use((req, res, next) => {
	if(res.headersSent) return next();
	next(new errors.BadRequest());
});

// handle exceptions 
app.use((err, req, res, next) => {
	if(res.headersSent) return next(err);
	if(err instanceof errors.HttpError)
	{
		res.status(err.status);
		res.json(err.json());
		res.end();
	}
	else
	{
		res.status(500);
		res.json({ error: 'InternalError' });
		res.end();
	}
	next(err);
});


var server = app.listen(config.organizations.port, () => {
  console.log('Organizations service listening on port ' + server.address().port);
});
