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
		
		onremove(connection, [this.id], (err, ) => {
			
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
	var 
	_onremove(connection, ids, callback, );
}

function _onremove(connection, ids, callback)
{
	var id = ids.pop();

	// count related documents
	connection.model('RelatedRestrict').count({ user: id }, (err, count) => {
		//if(err) ?

		if(count === 0)
		{
			connection.model('RelatedCascade').remove({}, (err, info) => {
				??????
			});
		}

		if(ids.length > 0)
			onremove(connection, ids, callback);
	});
}

