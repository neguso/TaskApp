// files service / implementation

var database = require('../../modules/database'),
		files = require('../../modules/files'),
		errors = require('../errors.js');


module.exports = {

	// GET /files/:id
	get: function(req, res, next)
	{
		var id = req.params.id;

		database.main.open().then((connection) => {
			
			//todo: authorization

			// get file document
			database.main.files.findById(id, (err, file) => {
				if(err)
					return next(new errors.NotFound());

				// get file content
				files.attachments.load(id, null, (err, data) => {
					if(err)
						return next(new errors.NotFound());
					
					res.setHeader('Content-disposition', 'attachment; filename=' + file.name);
					res.send(data);
					res.end();
					
					next();
				});
			});
			
		}, (err) => {
			next(new errors.Internal(err.message));
		});
	}

};
