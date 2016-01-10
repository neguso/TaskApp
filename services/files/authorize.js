// files service / authorization

var database = require('../../modules/database'),
		errors = require('../errors.js');


module.exports = {
	
	get: function(req, res, next)
	{
		var id = req.params.id;
		
		database.main.open().then((connection) => {
			
			//todo: authorization

			// get file document
			database.main.files.findById(id, (err, file) => {
				if(err)
					return next(new errors.Forbidden());

				//todo: check authorization
				// find related entity and based on that check if user

				next();
			});
			
		}, (err) => {
			next(new errors.Internal(err.message));
		});
	}
	
};
