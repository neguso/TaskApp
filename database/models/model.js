'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

var plugins = require('./plugins.js');

module.exports = function(connection)
{
	var xxxSchema = new Schema({
		f1: Schema.Types.String,
		f2: [{ type: Schema.Types.ObjectId, ref: 'zzz' }]
	}, { timestamps: { createdAt: 'createdon', updatedAt: 'updatedon' } });

	xxxSchema.virtual('property').get(function()
	{
		return /*expression*/;
	});

	xxxSchema.index({ f1: 1 }, { name: 'ix_f1' });

	xxxSchema.pre('remove', function(next) {

		// cascade delete
		// connection.models('zzz').remove({xxx_id: this.id}, (err) => {})

		next();
	});

	xxxSchema.methods.m1 = function()
	{
		// this - the document object
	};

	xxxSchema.statics.s1 = function()
	{
		// this - the model object
	};
	
	return mongoose.model('yyy', xxxSchema);
};
