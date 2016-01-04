'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

var plugins = require('./plugins.js');


module.exports = function(connection)
{
	var userSchema = new Schema({
		email: Schema.Types.String,
		firstname: Schema.Types.String,
		lastname: Schema.Types.String
	}, { timestamps: { createdAt: 'createdon', updatedAt: 'updatedon' } });

	userSchema.virtual('fullname').get(function()
	{
		return this.firstname + ' ' + this.lastname;
	});

	userSchema.index({ email: 1 }, { name: 'ix_email', unique: true });

	userSchema.pre('remove', function(next) {
		
		xxxxxx onremote trebuie apelata cu callback, de testat cum transmit eroarea mai sus
		onremove(connection, [this.id], (err) => {
			if(err) return next(new Error(err));
			
			
		});
		
		next();
	});

	userSchema.methods.delete = function()
	{
		this.remove.apply(this, arguments);
	};

	userSchema.statics.deleteById = function(id, callback)
	{
		onremove(connection, [id]);
		connection.model('User').remove({ _id: id }, (err, info) => {
			callback(err, info.result.n);
		});
	};
	
	userSchema.statics.delete = function(criteria, callback)
	{
		connection.model('User').find(criteria, '_id', { lean: true }, (err, ids) => {
			if(err) return callback(err, null);
			onremove(connection, ids);
			connection.model('User').remove(criteria, (err, info) => {
				if(err) return callback(err, null);
					
				callback(null, info.result.n);
			});
		});
	};


	return connection.model('User', userSchema);
};


function onremove(connection, ids, callback)
{
	var ary = new Array(ids.length);
	for(let i = 0; i < ids.length; i++)
	{
		((id) => {
			
			ary[i] = new Promise((resolve, reject) => {
			
				connection.model('OrganizationUserLink').remove({ user: id }, (err, info) => {
					if(err) return reject(err);

					resolve(info.result.n);
				});

			});
			
		})(ids[i]);
		
	}
	
	Promise.all(ary).then((results) => {
		callback(null, results);
	}, (err) => {
		callback(err);
	});
}
