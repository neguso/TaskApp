'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;


module.exports = function(connection)
{
	var teamuserlinkSchema = new Schema({
		timestamp: { type: Schema.Types.Date, default: Date.now },
		role: { type: Schema.Types.String, enum: ['owner', 'admin', 'member'] },
		team: { type: Schema.Types.ObjectId, ref: 'Team' },
		user: { type: Schema.Types.ObjectId, ref: 'User' }
	});

	teamuserlinkSchema.index({ team: 1, user: 1 }, { name: 'ix_team_user', unique: true });


	return connection.model('TeamUserLink', teamuserlinkSchema);
};
