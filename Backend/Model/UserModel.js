const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  gmail: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: false, trim: true },
  role: {
    type: String,
    required: true,
    enum: [
      'Client',
      'Admin',
      'Project Manager',
      'Site Supervisor',
      'Labor',
      // legacy
      'Site Manager',
      'Supervisor'
    ],
    default: 'Client'
  },
  age: { type: Number, required: false, min: 0 },
  address: { type: String, required: false, trim: true },
  profileImage: { type: String, required: false }, // URL or base64
  // Role-specific embedded sections
  companyDetails: { // Client specific
    companyName: { type: String },
    companyAddress: { type: String },
    companyPhone: { type: String },
    contactPerson: { type: String }
  },
  projectsManaged: [{ type: Schema.Types.ObjectId, ref: 'Project' }], // Project Manager
  assignedSites: [{ type: String }], // Site Supervisor / legacy site roles
  skills: [{ type: String }], // Labor
  availability: { // Labor availability block
    status: { type: String, enum: ['Available', 'Busy', 'Leave', 'Unavailable'], default: 'Available' },
    availableFrom: { type: Date },
    notes: { type: String }
  },
  notificationPreferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true }
  },
  activityLogs: [{
    action: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    at: { type: Date, default: Date.now }
  }],
  lastLogin: { type: Date },
  password: { type: String, required: true, minlength: 6 }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Convenience method to push an activity log
userSchema.methods.addActivity = async function(action, metadata = {}) {
  try {
    this.activityLogs.push({ action, metadata });
    // Keep only last 100 logs to prevent unbounded growth
    if (this.activityLogs.length > 100) {
      this.activityLogs = this.activityLogs.slice(-100);
    }
    await this.save();
  } catch (_) {
    // swallow to avoid breaking main flow
  }
};

module.exports = mongoose.model("User", userSchema);
