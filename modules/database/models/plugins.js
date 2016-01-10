var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var fileSchema = new Schema({
	name: Schema.Types.String,
	size: Schema.Types.Number,
	file: { type: Schema.Types.ObjectId, ref: 'File' }
});

exports.files = function(schema)
{
	schema.add({ files: [fileSchema] });
};
