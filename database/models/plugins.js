var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var fileSchema = new Schema({
	name: Schema.Types.String,
	size: Schema.Types.Number,
	key: Schema.Types.String
});

exports.files = function(schema)
{
	schema.add({ files: [fileSchema] });
};
