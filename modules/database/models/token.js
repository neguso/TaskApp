'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;


module.exports = function(connection)
{
	var tokenSchema = new Schema({
		id: Schema.Types.ObjectId,
		token: Schema.Types.String,
		expires: Schema.Types.Date
	}, { _id : false });

	tokenSchema.index({ id: 1 }, { name: 'ix_id' });


	return connection.model('Token', tokenSchema);
};
