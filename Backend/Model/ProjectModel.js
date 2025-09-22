const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Audit log schema
const auditLogSchema = new Schema({
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'VIEW']
  },
  field: String,
  oldValue: Schema.Types.Mixed,
  newValue: Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  },
  user: String,
  ipAddress: String
});

// Custom validation functions
const validateSpecialCharacters = function(value) {
  if (typeof value === 'string') {
    const specialChars = /[!#$%]/;
    return !specialChars.test(value);
  }
  return true;
};

const validateAge = function(value) {
  if (value && typeof value === 'number') {
    return value >= 0;
  }
  return true;
};

const validateBudget = function(value) {
  if (value && typeof value === 'number') {
    // Restrict to reasonable construction project budgets (100K to 1B)
    return value >= 100000 && value <= 1000000000;
  }
  return true;
};

const validateDateFromToday = function(value) {
  if (value) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return value >= today;
  }
  return true;
};

const validateBankAccount = function(value) {
  if (value && typeof value === 'string') {
    // Only allow numbers for bank account
    return /^\d+$/.test(value);
  }
  return true;
};

const projectSchema = new Schema({
  // Custom ID generation - more specific than random
  projectId: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `AD-${year}${month}-${random}`;
    }
  },

  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    minlength: [3, 'Project name must be at least 3 characters'],
    maxlength: [100, 'Project name cannot exceed 100 characters'],
    validate: {
      validator: validateSpecialCharacters,
      message: 'Project name cannot contain special characters (!, #, $, %)'
    }
  },

  client: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    minlength: [2, 'Client name must be at least 2 characters'],
    maxlength: [100, 'Client name cannot exceed 100 characters'],
    validate: {
      validator: validateSpecialCharacters,
      message: 'Client name cannot contain special characters (!, #, $, %)'
    }
  },

  clientContact: {
    phone: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^[\d\s\-\+\(\)]+$/.test(v);
        },
        message: 'Phone number can only contain digits, spaces, hyphens, plus signs, and parentheses'
      }
    },
    email: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },
    bankAccount: {
      type: String,
      validate: {
        validator: validateBankAccount,
        message: 'Bank account number can only contain digits'
      }
    }
  },

  status: {
    type: String,
    required: true,
    enum: {
      values: ['Planning', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
      message: 'Status must be one of: Planning, In Progress, Completed, On Hold, Cancelled'
    },
    default: 'Planning'
  },

  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },

  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: validateDateFromToday,
      message: 'Start date must be from today onwards'
    }
  },

  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        // If startDate is not present, skip validation (for updates)
        if (!this.startDate) return true;
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },

  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [100000, 'Budget must be at least Rs. 100,000'],
    max: [1000000000, 'Budget cannot exceed Rs. 1,000,000,000'],
    validate: {
      validator: validateBudget,
      message: 'Budget must be between Rs. 100K and Rs. 1B'
    }
  },

  completion: {
    type: Number,
    required: true,
    min: [0, 'Completion cannot be less than 0%'],
    max: [100, 'Completion cannot exceed 100%'],
    default: 0
  },

  // Project team information
  projectManager: {
    name: {
      type: String,
      trim: true,
      validate: {
        validator: validateSpecialCharacters,
        message: 'Project manager name cannot contain special characters (!, #, $, %)'
      }
    },
    age: {
      type: Number,
      validate: {
        validator: validateAge,
        message: 'Age must be a positive number'
      }
    },
    experience: {
      type: Number,
      min: [0, 'Experience cannot be negative']
    }
  },

  // Project details
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    validate: {
      validator: validateSpecialCharacters,
      message: 'Description cannot contain special characters (!, #, $, %)'
    }
  },

  location: {
    address: {
      type: String,
      trim: true,
      validate: {
        validator: validateSpecialCharacters,
        message: 'Address cannot contain special characters (!, #, $, %)'
      }
    },
    city: {
      type: String,
      trim: true,
      validate: {
        validator: validateSpecialCharacters,
        message: 'City cannot contain special characters (!, #, $, %)'
      }
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Audit trail
  auditLog: [auditLogSchema]
});

// Pre-save middleware to update timestamps and add audit log
projectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Add audit log for updates
  if (this.isModified() && !this.isNew) {
    this.auditLog.push({
      action: 'UPDATE',
      timestamp: new Date(),
      field: 'general',
      newValue: 'Project updated'
    });
  }
  
  next();
});

// Pre-remove middleware to add audit log
projectSchema.pre('remove', function(next) {
  this.auditLog.push({
    action: 'DELETE',
    timestamp: new Date(),
    field: 'general',
    oldValue: 'Project deleted'
  });
  next();
});

// Static method to get project statistics (60-30-10 rule)
projectSchema.statics.getProjectStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$count' },
        statusCounts: {
          $push: {
            status: '$_id',
            count: '$count'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        total: 1,
        statusCounts: 1,
        distribution: {
          $map: {
            input: '$statusCounts',
            as: 'status',
            in: {
              status: '$$status.status',
              count: '$$status.count',
              percentage: {
                $multiply: [
                  { $divide: ['$$status.count', '$total'] },
                  100
                ]
              }
            }
          }
        }
      }
    }
  ]);
};

// Instance method to add audit log entry
projectSchema.methods.addAuditLog = function(action, field, oldValue, newValue, user, ipAddress) {
  // Initialize auditLog array if it doesn't exist
  if (!this.auditLog) {
    this.auditLog = [];
  }
  
  this.auditLog.push({
    action,
    field,
    oldValue,
    newValue,
    timestamp: new Date(),
    user,
    ipAddress
  });
  return this.save();
};

module.exports = mongoose.model("Project", projectSchema);
