'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

var logger = require('../../logger'),
		plugins = require('./plugins.js');


module.exports = function(connection)
{
	var organizationSchema = new Schema({
		name: { type: Schema.Types.String, minlength: 1, maxlength: 64, required: true },
		description: { type: Schema.Types.String, maxlength: 512 }
	}, { timestamps: { createdAt: 'createdon', updatedAt: 'updatedon' } });

	organizationSchema.index({ name: 1 }, { name: 'ix_name' });

	organizationSchema.plugin(plugins.api, {
		connection: connection,
		model: 'Organization',
		beforeremove: beforeremove,
		afterremove: afterremove
	});

	organizationSchema.pre('remove', true, function(next, done) {
		beforeremove(connection, [this.id], (err, counts) => {
			if(err) return done(new Error(err));
			done();
		});
		next();
	});

	organizationSchema.post('remove', function(document) {
		afterremove(connection, [this.id], (err, result) => { /* nothing here, errors are logged */ });
	});


	return connection.model('Organization', organizationSchema);
};


function beforeremove(connection, ids, callback)
{
	var ary = new Array(ids.length);
	for(var i = 0; i < ids.length; i++)
	{
		((id) => {		
		
			ary[i] = new Promise((resolve, reject) => {
				
				// promise resolve if all dependencies can be deleted
				Promise.all([
					new Promise((resolve, reject) => {
						
						connection.model('Team').count({ organization: id }, (err, count) => {
							if(err) return reject(err);
							if(count > 0) return reject(count);

							resolve();
						});
						
					})
				]).then(() => {
					// there are no dependencies, we can cascade delete

					Promise.all([
						new Promise((resolve, reject) => {
						
							connection.model('OrganizationUserLink').remove({ organization: id }, (err, info) => {
								if(err) return reject(err);
								
								resolve(info.result.n);
							});
						
						})
					]).then(() => { resolve(); }, (err) => { reject(err); });
					
				}, (err) => {
					// there are dependenies, we cannot cascade delete
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

			});
			
		})(ids[i]);
		
	}

	Promise.all(ary).then((result) => {
		callback(null, result);
	});
}
