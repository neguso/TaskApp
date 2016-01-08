'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

var logger = require('../../logger'),
		plugins = require('./plugins.js');


module.exports = function(connection)
{
	var containerSchema = new Schema({
		name: Schema.Types.String,
		description: Schema.Types.String,
		container: Schema.Types.ObjectId
	}),
	tagSchema = new Schema({
		name: Schema.Types.String,
		color: Schema.Types.String
	});

	var projectSchema = new Schema({
		name: Schema.Types.String,
		description: Schema.Types.String,
		duedate: Schema.Types.String,
		state: Schema.Types.String,
		team: { type: Schema.Types.ObjectId, ref: 'Team' },
		containers: [containerSchema],
		tags: [tagSchema]
	}, { timestamps: { createdAt: 'createdon', updatedAt: 'updatedon' } });

	projectSchema.plugin(plugins.files);

	projectSchema.index({ name: 1 }, { name: 'ix_name' });

	projectSchema.pre('remove', true, function(next, done) {
		beforeremove(connection, [this.id], (err, result) => {
			if(err) return done(err);
			done();
		});
		next();
	});
	
	projectSchema.post('remove', function(document) {
		afterremove(connection, [this.id], (err, result) => { /* nothing here, errors are logged */ });
	});

	projectSchema.methods.delete = function()
	{
		this.remove.apply(this, arguments);
	};

	projectSchema.statics.deleteById = function(id, callback)
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
	
	projectSchema.statics.delete = function(criteria, callback)
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


	return connection.model('Project', projectSchema);
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
						connection.model('ProjectUserLink').remove({ project: id }, (err, info) => {
							if(err) return reject(err);
							resolve(info.result.n);
						});
					}),
					new Promise((resolve, reject) => {
						connection.model('Task').delete({ project: id }, (err, info) => {
							if(err) return reject(err);
							resolve(info.result.n);
						});
					}),
					new Promise((resolve, reject) => {
						connection.model('Message').delete({ entity: id }, (err, info) => {
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

				//todo: delete files

			});
			
		})(ids[i]);
	}

	Promise.all(ary).then((result) => {
		callback(null, result);
	});
}
