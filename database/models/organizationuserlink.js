'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var organizationuserlinkSchema = new Schema({
	role: { type: Schema.Types.String, enum: ['owner', 'admin', 'member', 'guest'] },
	organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
	user: { type: Schema.Types.ObjectId, ref: 'User' }
});

organizationuserlinkSchema.index({ organization: 1, user: 1 }, { name: 'ix_organization_user', unique: true });

exports.OrganizationUserLink = mongoose.model('OrganizationUserLink', organizationuserlinkSchema);
