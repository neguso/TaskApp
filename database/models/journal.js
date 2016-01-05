'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;


module.exports = function(connection)
{
	var journalSchema = new Schema({
		timestamp: { type: Schema.Types.Date, default: Date.now },
		content: { type: Schema.Types.String, maxlength: 1024 },
		entity: Schema.Types.ObjectId
	});

	journalSchema.index({ timestamp: 1, entity: 1 }, { name: 'ix_timestamp_entity' });

	return connection.model('Journal', journalSchema);
};