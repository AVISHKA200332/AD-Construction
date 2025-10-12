const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  gmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    set: v => {
      if (v === null || v === undefined) return v;
      const s = v.toString();
      return s.replace(/\D/g, '');
    },
    validate: {
      validator: function(v) {
        if (v === null || v === undefined || v === '') return true; // optional
        const digits = v.toString().replace(/\D/g, '');
        return digits.length === 10;
      },
      message: 'Phone number must be exactly 10 digits'
    }
  },
  role: {
    type: String,hhhh
    required: true,
    enum: ["Client", "Admin", "Site Manager", "Supervisor", "Labor"],
    default: "Client"
  },
  age: {
    type: Number,
    required: false,
    min: 0
  },
  address: {
    type: String,
    required: false,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, {
  timestamps: true //  add createdAt and updatedAt
});

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

module.exports = mongoose.model("User", userSchema);
