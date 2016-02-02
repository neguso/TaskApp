'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;


module.exports = function(connection)
{
	var organizationuserlinkSchema = new Schema({
		timestamp: { type: Schema.Types.Date, default: Date.now },
		role: { type: Schema.Types.String, enum: ['owner', 'admin', 'member', 'guest'], required: true },
		organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
	});

	organizationuserlinkSchema.index({ organization: 1, user: 1 }, { name: 'ix_organization_user', unique: true });


	return connection.model('OrganizationUserLink', organizationuserlinkSchema);
};
