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

	organizationSchema.pre('remove', function(next) {

		onremove(connection, [this.id], (err, counts) => {
			if(err) return next(new Error(err));
			
			
		});

		next();
	});

	// assign user to organization
	organizationSchema.methods.assign = function(user, role, cb)
	{
		connection.models('OrganizationUserLink').create({
			role: role,
			ogranization: this.id,
			user: user
		}, cb);
	};

	organizationSchema.methods.delete = function()
	{
		this.remove.apply(this, arguments);
	};

	organizationSchema.statics.deleteById = function(id, callback)
	{
		onremove(connection, [id]);
		connection.model('Organization').remove({ _id: id }, (err, info) => {
			callback(err, info.result.n);
		});
	};
	
	organizationSchema.statics.delete = function(criteria, callback)
	{
		connection.model('Organization').find(criteria, '_id', { lean: true }, (err, ids) => {
			if(err) return callback(err, null);
			onremove(connection, ids);
			connection.model('Organization').remove(criteria, (err, info) => {
				if(err) return callback(err, null);
					
				callback(null, info.result.n);
			});
		});
	};

	
	return mongoose.model('Organization', organizationSchema);
};


function onremove(connection, ids, callback)
{
	var counts = [];
	_onremove(connection, ids.slice(), callback, counts);
}

function _onremove(connection, ids, callback, counts)
{
	var id = ids.pop();
	
	// count related documents
	connection.model('Team').count({ organization: id }, (err, count) => {
		if(err) return callback(err);

		if(count === 0)
		{
			connection.model('OrganizationUserLink').remove({ organization: id }, (err, info) => {
				if(err) return callback(err);
				
				counts.push(info.result.n);
				
				if(ids.length === 0)
					callback(null, counts.reverse());
				else
					onremove(connection, ids, callback);
			});
		}
		else
		{
			counts.push(0);

			if(ids.length > 0)
				onremove(connection, ids, callback);
		}
	});
}