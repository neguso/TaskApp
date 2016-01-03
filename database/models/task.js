var mongoose = require('mongoose');
var plugins = require('./plugins.js');

var models = {
	//Message: require('./message.js').Message,
	//Activity: require('./activity.js').Activity
};

var Schema = mongoose.Schema;

var taskSchema = new Schema({
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

taskSchema.index({ name: 1 }, { name: 'ix_name' });

var TaskModel = mongoose.model('Task', taskSchema);

taskSchema.pre('remove', function(next) {

	// cascade delete
	//models.Message.find({ entity: this._id }).remove().exec();
	TaskModel.find({ task: this._id }).remove().exec();
	//models.Activity.find({ task: this._id }).remove().exec();

	next();
});

exports.Task = TaskModel;
