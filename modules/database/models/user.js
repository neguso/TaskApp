'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

var logger = require('../../logger'),
		plugins = require('./plugins.js');


module.exports = function(connection)
{
	var userSchema = new Schema({
		email: { type: Schema.Types.String, minlength: 1, maxlength: 128, required: true },
		password: { type: Schema.Types.String, minlength: 1, maxlength: 32 },
		firstname: { type: Schema.Types.String, minlength: 1, maxlength: 32, required: true },
		lastname: { type: Schema.Types.String, minlength: 1, maxlength: 32 }
	}, { timestamps: { createdAt: 'createdon', updatedAt: 'updatedon' } });

	userSchema.virtual('fullname').get(function()
	{
		return this.firstname + ' ' + this.lastname;
	});

	userSchema.index({ email: 1 }, { name: 'ix_email', unique: true });

	userSchema.pre('remove', true, function(next, done) {
		beforeremove(connection, [this.id], (err, result) => {
			if(err) return done(err);
			done();
		});
		next();
	});
	
	userSchema.post('remove', function(document) {
		afterremove(connection, [this.id], (err, result) => { /* nothing here, errors are logged */ });
	});

	userSchema.methods.delete = function()
	{
		this.remove.apply(this, arguments);
	};

	userSchema.statics.deleteById = function(id, callback)
	{
		beforeremove(connection, [id], (err, result) => {
			if(err) return callback(err);
			
			connection.model('User').remove({ _id: id }, (err, info) => {
				if(err) return callback(err);

				callback(null, info.result.n);
				
				afterremove(connection, [id], (err, result) => { /* nothing here, errors are logged */ });
			});
		});
	};

	userSchema.statics.delete = function(criteria, callback)
	{
		connection.model('User').find(criteria, '_id', { lean: true }, (err, ids) => {
			if(err) return callback(err);
			
			beforeremove(connection, ids, (err, result) => {
				if(err) return callback(err);
				
				connection.model('User').remove(criteria, (err, info) => {
					if(err) return callback(err);
						
					callback(null, info.result.n);
					
					afterremove(connection, ids, (err, result) => { /* nothing here, errors are logged */ });
				});
			});
		});
	};


	return connection.model('User', userSchema);
};


function beforeremove(connection, ids, callback)
{
	var ary = new Array(ids.length);
	for(let i = 0; i < ids.length; i++)
	{
		((id) => {

			ary[i] = new Promise((resolve, reject) => {

				Promise.all([

					new Promise((resolve, reject) => {
						connection.model('OrganizationUserLink').remove({ user: id }, (err, info) => {
							if(err) return reject(err);

							resolve(info.result.n);
						});
					}),
					new Promise((resolve, reject) => {
						connection.model('TeamUserLink').remove({ user: id }, (err, info) => {
							if(err) return reject(err);

							resolve(info.result.n);
						});
					}),
					new Promise((resolve, reject) => {
						connection.model('ProjectUserLink').remove({ user: id }, (err, info) => {
							if(err) return reject(err);

							resolve(info.result.n);
						});
					})

				]).then((result) => {
					resolve(result);
				}, (err) => {
					reject(err);
				});

			});

		})(ids[i]);
	}

	Promise.all(ary).then((result) => {
		callback(null, result);
	}, (err) => {
		callback(err);
	});
}

function afterremove(connection, ids, callback)
{
	var ary = new Array(ids.length);
	for(let i = 0; i < ids.length; i++)
	{
		((id) => {

			ary[i] = new Promise((resolve, reject) => {

				connection.model('Journal').remove({ entity: id }, (err, info) => {
					if(err)
					{
						logger.log('failed to delete journal for entity: %s, reason: %s', id, err.message);
						resolve(err);
						return;
					}
					resolve(info.result.n);
				});
				
				//todo: clear user refference in messages

			});
			
		})(ids[i]);
	}

	Promise.all(ary).then((result) => {
		callback(null, result);
	});
}
