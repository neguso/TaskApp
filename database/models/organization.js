'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

var plugins = require('./plugins.js');

module.exports = function(connection)
{
	var organizationSchema = new Schema({
		name: { type: Schema.Types.String, maxLength: 128 },
		description: { type: Schema.Types.String, maxLength: 1024 }
	}, { timestamps: { createdAt: 'createdon', updatedAt: 'updatedon' } });

	organizationSchema.index({ name: 1 }, { name: 'ix_name' });

	// assign user to organization
	organizationSchema.methods.assign = function(user, role, cb)
	{
		connection.models('OrganizationUserLink').create({
			role: role,
			ogranization: this.id,
			user: user
		}, cb);
	};

	organizationSchema.pre('remove', function(next) {

		// check if organization has teams
		connection.models('Team').findOne({ organization: this.id }, (err, team) => {

		});

		// cascade delete
		//...

		next();
	});
	
	return mongoose.model('Organization', organizationSchema);
};
