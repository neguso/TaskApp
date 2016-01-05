'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

var logger = require('../../library/logger.js'),
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

				//todo: clear message refferences
				//todo: remove attached files

			});
			
		})(ids[i]);
	}

	Promise.all(ary).then((result) => {
		callback(null, result);
	});
}









var config = require('../config.js');
var attachments = require('../core/attachments.js')(config.files.location);




// assign user to project
projectSchema.methods.assign = function(user, role, cb)
{
	models.ProjectUserLink.create({
		role: role,
		project: this.id,
		user: user
	}, cb);
};


var ProjectModel = mongoose.model('Project', projectSchema);

exports.Project = ProjectModel;


projectSchema.pre('remove', function(next) {

	// cascade delete user links
	models.ProjectUserLink.find({ project: this._id }).remove().exec();

	// cascade delete files
	this.files.map((file) => attachments.remove(file.key));

	next();
});

/**
 * Read user projects.
 * @param {ObjectID} userId
 * @returns {Promise} A promise that returns an array of {@link ProjectInfo} objects.
 */
projectSchema.statics.read = function(userId) {
	return new Promise(function(resolve, reject) {

		models.ProjectUserLink.find({ user: userId }, 'project', { lean: true }).populate('project', 'name description').exec(function(err, documents)
		{
			if(err) return reject(err);

			resolve(documents.map(function(p) {
				return { _id: p.project._id, name: p.project.name, description: p.project.description }
			}));
		});

	});
};


/**
 * Project model object.
 * @typedef {object} ProjectModel
 * @prop {ObjectID} _id
 * @prop {string} name
 * @prop {string} description
 * @prop { Array.<ContainerModel> } containers
 * @prop { Array.<TagModel> } tags
 * @prop { Array.<FileModel> } files
 */

/**
 * Container model object.
 * @typedef {object} ContainerModel
 * @prop {string} name
 * @prop {string} description
 */

/**
 * Tag model object.
 * @typedef {object} TagModel
 * @prop {string} name
 * @prop {string} color
 */

/**
 * File model object.
 * @typedef {object} FileModel
 * @prop {string} name
 * @prop {number} size
 * @prop {string} key
 */