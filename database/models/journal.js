'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;


module.exports = function(connection)
{
	var journalSchema = new Schema({
		timestamp: Schema.Types.Date,
		content: Schema.Types.String,
		entity: Schema.Types.ObjectId
	});

	journalSchema.index({ timestamp: 1, entity: 1 }, { name: 'ix_timestamp_entity' });


	return connection.model('Journal', journalSchema);
};