'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

var logger = require('../../logger'),
		plugins = require('./plugins.js');


module.exports = function(connection)
{
	var messageSchema = new Schema({
		timestamp: { type: Schema.Types.Date, default: Date.now },
		content: { type: Schema.Types.String, maxlength: 512 },
		message: { type: Schema.Types.ObjectId, ref: 'Message' },
		user: { type: Schema.Types.ObjectId, ref: 'User' }
	});

	messageSchema.plugin(plugins.files);

	messageSchema.index({ timestamp: 1, user: 1 }, { name: 'ix_timestamp_user' });

	messageSchema.post('remove', function(document) {
		afterremove(connection, { _id: this.id }, (err, result) => { /* nothing here, errors are logged */ });
	});

	messageSchema.methods.delete = function()
	{
		this.remove.apply(this, arguments);
	};

	messageSchema.statics.deleteById = function(id, callback)
	{
		connection.model('Message').remove({ _id: id }, (err, info) => {
			if(err) return callback(err);

			callback(null, info.result.n);
			
			afterremove(connection, { _id: id }, (err, result) => { /* nothing here, errors are logged */ });
		});
	};
	
	messageSchema.statics.delete = function(criteria, callback)
	{
		connection.model('Message').remove(criteria, (err, info) => {
			if(err) return callback(err);
				
			callback(null, info.result.n);
			
			afterremove(connection, criteria, (err, result) => { /* nothing here, errors are logged */ });
		});
	};


	return connection.model('Message', messageSchema);
};


function afterremove(connection, condition, callback)
{
	connection.model('Messages').find(condition, 'files', { lean: true }, (err, messages) => {
		if(err) return callback(err);
		
		var keys = new Array();
		messages.forEach((message) => {
			keys.push(message.files.map((file) => { return file.key; }));
		});
		
		//todo: delete files
	});
}
