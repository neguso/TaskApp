'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;


module.exports = function(connection)
{
	var fileSchema = new Schema({
		name: Schema.Types.String,
		size: Schema.Types.Number,
		entity: Schema.Types.ObjectId,
		entitytype: { type: Schema.Types.String, enum: ['message', 'project', 'task', 'activity'] }
	});

	fileSchema.index({ entity: 1 }, { name: 'ix_entity' });


	return connection.model('File', fileSchema);
};
