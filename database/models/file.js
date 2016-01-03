var mongoose = require('mongoose');
var path = require('path');

var plugins = require('./plugins.js');

var Schema = mongoose.Schema;

var fileSchema = new Schema({
	name: Schema.Types.String,
	size: Schema.Types.Number,
	key: Schema.Types.String
}, { timestamps: { createdAt: 'createdon', updatedAt: 'updatedon' } });

fileSchema.virtual('extension').get(function()
{
	return path.extname(this.name);
});

fileSchema.index({ key: 1 }, { name: 'ix_key' });

exports.File = mongoose.model('File', fileSchema);
