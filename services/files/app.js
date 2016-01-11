// files service / public interface

var	express = require('express');

var config = require('../../config.js'),
		errors = require('../errors.js');


var app = express();

// install middleware
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('../monitor.js').performance);
app.use(require('../monitor.js').logging);

// handle authentication
app.all('/*', require('../authenticate.js'));

// handle application logic
app.use('/files', require('./routes.js'));

// handle unknown routes
app.use((req, res, next) => {
	if(res.headersSent) return next();
	res.status(400);
	res.json({ code: 'Bad Request' });
	res.end();
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


var server = app.listen(config.files.port, () => {
  console.log('Files service listening on port ' + server.address().port);
});
