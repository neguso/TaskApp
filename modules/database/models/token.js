'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;


module.exports = function(connection)
{
	var tokenSchema = new Schema({
		token: Schema.Types.String,
		user: { type: Schema.Types.ObjectId, ref: 'User' },
		expires: { type: Schema.Types.Date, index: { name: 'ix_expires', expires: 0 }}
	});

	tokenSchema.index({ token: 1 }, { name: 'ix_token', unique: true });


	return connection.model('Token', tokenSchema);
};
