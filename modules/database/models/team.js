'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

var logger = require('../../library/logger.js'),
		plugins = require('./plugins.js');


module.exports = function(connection)
{
	var teamSchema = new Schema({
		name: Schema.Types.String,
		description: Schema.Types.String,
		access: { type: Schema.Types.String, enum: ['public', 'managed', 'private'] },
		organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
		team: { type: Schema.Types.ObjectId, ref: 'Team' },
		teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }]
	}, { timestamps: { createdAt: 'createdon', updatedAt: 'updatedon' } });

	teamSchema.index({ organization: 1 }, { name: 'ix_organization' });

	teamSchema.pre('remove', true, function(next, done) {
		beforeremove(connection, [this.id], (err, result) => {
			if(err) return done(new Error(err));
			done();
		});
		next();
	});

	teamSchema.post('remove', function(document) {
		afterremove(connection, [this.id], (err, result) => { /* nothing here, errors are logged */ });
	});

	teamSchema.methods.delete = function()
	{
		this.remove.apply(this, arguments);
	};

	teamSchema.statics.deleteById = function(id, callback)
	{
		beforeremove(connection, [id], (err, result) => {
			if(err) return callback(err);
			
			connection.model('Team').remove({ _id: id }, (err, info) => {
				if(err) return callback(err);

				callback(null, info.result.n);

				afterremove(connection, [id], (err, result) => { /* nothing here, errors are logged */ });
			});
		});
	};
	
	teamSchema.statics.delete = function(criteria, callback)
	{
		connection.model('Team').find(criteria, '_id', { lean: true }, (err, ids) => {
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


	return connection.model('Team', teamSchema);
};


function beforeremove(connection, ids, callback)
{
	var ary = new Array(ids.length);
	for(let i = 0; i < ids.length; i++)
	{
		((id) => {
			
			ary[i] = new Promise((resolve, reject) => {

				connection.model('TeamUserLink').remove({ user: id }, (err, info) => {
					if(err) return reject(err);

					resolve(info.result.n);
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

			});
			
		})(ids[i]);
	}

	Promise.all(ary).then((result) => {
		callback(null, result);
	});
}
