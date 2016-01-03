'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var projectuserlinkSchema = new Schema({
	role: { type: Schema.Types.String, enum: ['admin', 'default'] },
	project: { type: Schema.Types.ObjectId, ref: 'Project' },
	user: { type: Schema.Types.ObjectId, ref: 'User' }
});

projectuserlinkSchema.index({ project: 1, user: 1 }, { name: 'ix_project_user', unique: true });

exports.ProjectUserLink = mongoose.model('ProjectUserLink', projectuserlinkSchema);
