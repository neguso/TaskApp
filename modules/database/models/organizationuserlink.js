'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

var logger = require('../../logger'),
		plugins = require('./plugins.js');


module.exports = function(connection)
{
	var organizationuserlinkSchema = new Schema({
		timestamp: { type: Schema.Types.Date, default: Date.now },
		role: { type: Schema.Types.String, enum: ['owner', 'admin', 'member', 'guest'], required: true },
		organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
	});

	organizationuserlinkSchema.index({ organization: 1, user: 1 }, { name: 'ix_organization_user', unique: true });

	organizationuserlinkSchema.plugin(plugins.api, { connection: connection, model: 'OrganizationUserLink' });

	organizationuserlinkSchema.pre('save', function(next) {
		// check [organization, user] references
		Promise.all([
			new Promise((resolve, reject) => {
				connection.model('Organization').count({ _id: this.organization }, (err, count) => {
					if(err) return reject(err);
					if(count === 0)
						return reject(new Error('Invalid reference: Organization'));
					resolve();
				});
			}),
			new Promise((resolve, reject) => {
				connection.model('User').count({ _id: this.user }, (err, count) => {
					if(err) return reject(err);
					if(count === 0)
						return reject(new Error('Invalid reference: User'));
					resolve();
				});
			})
		]).then(() => {
			next();
		}, (err) => {
			next(err);
		});
	});


	return connection.model('OrganizationUserLink', organizationuserlinkSchema);
};
