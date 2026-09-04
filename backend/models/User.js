'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [12, 'Password must be at least 12 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  // Profile preferences
  language: { type: String, default: 'en' },
  timezone: { type: String, default: 'UTC' },
  theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },

  // Notification preferences
  notificationPrefs: {
    taskUpdates: { type: Boolean, default: true },
    taskDeadlines: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: false }
  },

  // App-level preferences (stored as flexible object)
  appPrefs: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Extended settings (for the settings page)
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

/**
 * Validate raw password strength before hashing.
 * Call this before creating/updating a password.
 */
userSchema.statics.validatePasswordStrength = (password) => {
  if (!password || password.length < 12) {
    return 'Password must be at least 12 characters long';
  }
  if (!PASSWORD_REGEX.test(password)) {
    return 'Password must contain uppercase, lowercase, a number, and a special character';
  }
  return null;
};

module.exports = mongoose.model('User', userSchema);
