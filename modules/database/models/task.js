'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

var logger = require('../../logger'),
		plugins = require('./plugins.js');


module.exports = function(connection)
{
	var taskSchema = new Schema({
		index: Schema.Types.Number,
		name: Schema.Types.String,
		description: Schema.Types.String,
		start: Schema.Types.Date,
		due: Schema.Types.Date,
		project: { type: Schema.Types.ObjectId, ref: 'Project' },
		task: { type: Schema.Types.ObjectId, ref: 'Task' },
		container: Schema.Types.ObjectId, // ref: Project.Container
		tags: [Schema.Types.ObjectId], // ref: Project.Tag
		users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
	}, { timestamps: { createdAt: 'createdon', updatedAt: 'updatedon' } });

	taskSchema.plugin(plugins.files);

	taskSchema.index({ project: 1, index: 1 }, { name: 'ix_project_index' });

	taskSchema.pre('remove', true, function(next, done) {
		beforeremove(connection, [this.id], (err, result) => {
			if(err) return done(err);
			done();
		});
		next();
	});

	taskSchema.post('remove', function(document) {
		afterremove(connection, [this.id], (err, result) => { /* nothing here, errors are logged */ });
	});

	taskSchema.methods.delete = function()
	{
		this.remove.apply(this, arguments);
	};

	taskSchema.statics.deleteById = function(id, callback)
	{
		beforeremove(connection, [id], (err, result) => {
			if(err) return callback(err);
			
			connection.model('Task').remove({ _id: id }, (err, info) => {
				if(err) return callback(err);

				callback(null, info.result.n);
				
				afterremove(connection, [id], (err, result) => { /* nothing here, errors are logged */ });
			});
		});
	};
	
	taskSchema.statics.delete = function(criteria, callback)
	{
		connection.model('Task').find(criteria, '_id', { lean: true }, (err, ids) => {
			if(err) return callback(err);
			
			beforeremove(connection, ids, (err, result) => {
				if(err) return callback(err);
				
				connection.model('Task').remove(criteria, (err, info) => {
					if(err) return callback(err);
						
					callback(null, info.result.n);
					
					afterremove(connection, ids, (err, result) => { /* nothing here, errors are logged */ });
				});
			});
		});
	};


	return connection.model('Task', taskSchema);
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
						connection.model('Task').remove({ task: id }, (err, info) => {
							if(err) return reject(err);

							resolve(info.result.n);
						});
					}),
					// new Promise((resolve, reject) => {
					// 	connection.model('Activity').remove({ task: id }, (err, info) => {
					// 		if(err) return reject(err);

					// 		resolve(info.result.n);
					// 	});
					// }),
					new Promise((resolve, reject) => {
						connection.model('Message').remove({ entity: id }, (err, info) => {
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
