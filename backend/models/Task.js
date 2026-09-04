'use strict';

const mongoose = require('mongoose');

const progressEntrySchema = new mongoose.Schema({
  date: { type: String, required: true },
  progress: { type: Number, min: 0, max: 100, required: true },
  note: { type: String, default: '' }
}, { _id: false });

const timeEntrySchema = new mongoose.Schema({
  date: { type: String, required: true },
  hours: { type: Number, min: 0, required: true },
  description: { type: String, default: '' }
}, { _id: false });

const dailyUpdateSchema = new mongoose.Schema({
  date: { type: String, required: true },
  workedOn: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  accomplishments: [{ type: String }],
  blockers: [{ type: String }],
  nextSteps: [{ type: String }],
  mood: { type: String, default: 'neutral' }
}, { _id: false });

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  dueDate: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters'],
    default: ''
  },
  estimatedHours: { type: Number, min: 0, default: null },
  totalTimeSpent: { type: Number, min: 0, default: 0 },

  progressHistory: [progressEntrySchema],
  timeEntries: [timeEntrySchema],
  dailyUpdates: [dailyUpdateSchema],

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, dueDate: 1 });

// Auto-set completedAt when status changes to completed
taskSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
    this.progress = 100;
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
