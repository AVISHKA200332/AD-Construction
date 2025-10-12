const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  serviceType: { type: String, required: true },
  provider: { type: String, required: true },
  status: { type: String, required: true },
  date: { type: Date, required: true },
  cost: { type: Number, required: true },
  message: { type: String },
  // Assignment fields
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedDate: { type: Date, default: null },
  assignedToName: { type: String, default: null }, // For display purposes
  assignedByName: { type: String, default: null }, // For display purposes
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
