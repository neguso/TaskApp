var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var fileSchema = new Schema({
	name: Schema.Types.String,
	size: Schema.Types.Number,
	file: { type: Schema.Types.ObjectId, ref: 'File' }
});

exports.files = function(schema)
{
	schema.add({ files: [fileSchema] });
};

exports.api = function(schema, params)
{
	schema.statics.updateOne = function(condition, update, options, callback)
	{
		var connection = params.connection, model = connection.model(params.model);

		model.findOne(condition, (err, document) => {
			if(err) return callback(err);

			if(document === null)
			{
				if(options.upsert)
				{
					// insert //
					model.create(update, (err, insertedDocument) => {
						if(err) return callback(err);
						callback(null, options.new ? insertedDocument : document);
					});
				}
				else
					callback(null, null);
			}
			else
			{
				// update //
				Object.keys(update).forEach((property) => {
					document[property] = update[property];
				});
				document.save((err, updatedDocument, numAffected) => {
					if(err) return callback(err);

					if(numAffected === 0)
					{
						// insert //
						model.create(update, (err, insertedDocument) => {
							if(err) return callback(err);
							callback(null, options.new ? insertedDocument : document);
						});
					}
					else
						callback(null, options.new ? updatedDocument : document);
				});
			}
		});
	};
};