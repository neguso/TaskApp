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
				if(document.isModified())
				{
					document.save((err, updatedDocument, numAffected) => {
						if(err) return callback(err);

						if(numAffected === 0)
						{
							// insert //
							var create = document.toObject({ virtuals: false, versionKey: false });
							delete create._id;
							delete create.createdon;
							delete create.updatedon;
							model.create(create, (err, insertedDocument) => {
								if(err) return callback(err);
								callback(null, options.new ? insertedDocument : document);
							});
						}
						else
							callback(null, options.new ? updatedDocument : document);
					});
				}
				else
					callback(null, null);
			}
		});
	};

	schema.methods.delete = function()
	{
		this.remove.apply(this, arguments);
	};

	schema.statics.deleteById = function(id, callback)
	{
		var	connection = params.connection,
				model = connection.model(params.model),
				beforeremove = params.beforeremove || ((connection, ids, callback) => { callback(null, null); }),
				afterremove = params.afterremove || ((connection, ids, callback) => { callback(null, null); });

		beforeremove(connection, [id], (err, result) => {
			if(err) return callback(err);

			model.remove({ _id: id }, (err, info) => {
				if(err) return callback(err);

				callback(null, info.result.n);

				afterremove(connection, [id], (err, result) => { /* nothing here, errors are logged */ });
			});
		});
	};
	
	schema.statics.delete = function(criteria, callback)
	{
		var	connection = params.connection,
				model = connection.model(params.model),
				beforeremove = params.beforeremove || ((connection, ids, callback) => { callback(null, null); }),
				afterremove = params.afterremove || ((connection, ids, callback) => { callback(null, null); });

		model.find(criteria, '_id', { lean: true }, (err, ids) => {
			if(err) return callback(err);

			beforeremove(connection, ids, (err, result) => {
				if(err) return callback(err);

				model.remove(criteria, (err, info) => {
					if(err) return callback(err);
						
					callback(null, info.result.n);

					afterremove(connection, ids, (err, result) => { /* nothing here, errors are logged */ });
				});
			});
		});
	};


};