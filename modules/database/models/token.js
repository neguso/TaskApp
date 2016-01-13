'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;


module.exports = function(connection)
{
	var tokenSchema = new Schema({
		token: { type: Schema.Types.String, required: true },
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		expires: { type: Schema.Types.Date, required: true, index: { name: 'ix_expires', expires: 0 }}
	});

	tokenSchema.index({ token: 1 }, { name: 'ix_token', unique: true });


	return connection.model('Token', tokenSchema);
};
