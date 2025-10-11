const mongoose = require('mongoose');
const { Schema } = mongoose;

const workLogSchema = new Schema({
  note: String,
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

const taskSchema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['Assigned', 'In Progress', 'Completed'], default: 'Assigned' },
  supervisor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  laborers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  dueDate: { type: Date },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  workLogs: [workLogSchema]
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
