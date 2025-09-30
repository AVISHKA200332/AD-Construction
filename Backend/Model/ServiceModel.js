const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  serviceType: { type: String, required: true },
  // Display-only provider name (will be derived from assignee when creating)
  provider: { type: String, required: true },
  // ID-based routing
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending' },
  date: { type: Date, required: true },
  cost: { type: Number, required: true },
  message: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
