'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const { authenticate } = require('../middleware/auth');
const { emitToUser } = require('../utils/socketManager');

const router = express.Router();

const toId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
};

const today = () => new Date().toISOString().split('T')[0];

// GET /api/v1/tasks/health
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Task service healthy', timestamp: new Date().toISOString() });
});

// GET /api/v1/tasks/stats
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [total, completed, inProgress, pending] = await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, status: 'completed' }),
      Task.countDocuments({ user: userId, status: 'in-progress' }),
      Task.countDocuments({ user: userId, status: 'pending' })
    ]);
    const overdue = await Task.countDocuments({
      user: userId,
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() }
    });

    const aggResult = await Task.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, avgProgress: { $avg: '$progress' }, totalTime: { $sum: '$totalTimeSpent' } } }
    ]);
    const { avgProgress = 0, totalTime = 0 } = aggResult[0] || {};

    res.json({ success: true, stats: { total, completed, 'in-progress': inProgress, pending, overdue, averageProgress: Math.round(avgProgress), totalTimeSpent: totalTime } });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/tasks/analytics
router.get('/analytics', authenticate, async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).lean();

    const productivityByDay = {};
    const timeByDay = {};
    let totalTime = 0;
    let totalProgress = 0;

    tasks.forEach((task) => {
      totalProgress += task.progress;
      totalTime += task.totalTimeSpent || 0;

      (task.dailyUpdates || []).forEach((u) => {
        if (!productivityByDay[u.date]) {
          productivityByDay[u.date] = { tasksWorkedOn: 0, accomplishments: 0, blockers: 0 };
        }
        if (u.workedOn) {
          productivityByDay[u.date].tasksWorkedOn++;
          productivityByDay[u.date].accomplishments += (u.accomplishments || []).length;
          productivityByDay[u.date].blockers += (u.blockers || []).length;
        }
      });

      (task.timeEntries || []).forEach((e) => {
        timeByDay[e.date] = (timeByDay[e.date] || 0) + e.hours;
      });
    });

    res.json({
      success: true,
      analytics: {
        totalTasks: tasks.length,
        averageProgress: tasks.length ? Math.round(totalProgress / tasks.length) : 0,
        totalTimeSpent: totalTime,
        productivityByDay,
        timeByDay
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/tasks
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, priority, search, limit, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = { $in: status.split(',').map((s) => s.trim()) };
    if (priority) query.priority = priority;
    if (search) {
      const re = new RegExp(search, 'i');
      query.$or = [{ title: re }, { description: re }];
    }

    const sortDir = sortOrder === 'asc' ? 1 : -1;
    let q = Task.find(query).sort({ [sortBy]: sortDir });
    if (limit) q = q.limit(parseInt(limit, 10));

    const tasks = await q.lean();
    res.json({ success: true, tasks, total: tasks.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/tasks
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, status, category, estimatedHours } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
      priority: priority || 'medium',
      status: status || 'pending',
      dueDate: dueDate || null,
      category: category?.trim() || '',
      estimatedHours: estimatedHours || null,
      user: req.user._id
    });

    emitToUser(req.user._id, 'task:created', task);
    res.status(201).json({ success: true, task, message: 'Task created' });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/tasks/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: 'Invalid task ID' });

    const task = await Task.findOne({ _id: id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/tasks/:id
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: 'Invalid task ID' });

    const allowed = ['title', 'description', 'status', 'priority', 'dueDate', 'category', 'estimatedHours', 'progress'];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const task = await Task.findOneAndUpdate({ _id: id, user: req.user._id }, updates, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    emitToUser(req.user._id, 'task:updated', task);
    res.json({ success: true, task, message: 'Task updated' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/tasks/:id
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: 'Invalid task ID' });

    const task = await Task.findOneAndUpdate({ _id: id, user: req.user._id }, req.body, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    emitToUser(req.user._id, 'task:updated', task);
    res.json({ success: true, task, message: 'Task updated' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/tasks/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: 'Invalid task ID' });

    const task = await Task.findOneAndDelete({ _id: id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    emitToUser(req.user._id, 'task:deleted', { id: task._id });
    res.json({ success: true, message: 'Task deleted', task });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/tasks/:id/progress
router.patch('/:id/progress', authenticate, async (req, res, next) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: 'Invalid task ID' });

    const { progress, note } = req.body;
    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({ success: false, message: 'Progress must be between 0 and 100' });
    }

    const task = await Task.findOne({ _id: id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const dateStr = today();
    task.progress = progress;

    const existing = task.progressHistory.findIndex((h) => h.date === dateStr);
    const entry = { date: dateStr, progress, note: note || '' };
    if (existing >= 0) task.progressHistory[existing] = entry;
    else task.progressHistory.push(entry);

    if (progress === 100) {
      task.status = 'completed';
      task.completedAt = task.completedAt || new Date();
    }

    await task.save();
    res.json({ success: true, task, message: 'Progress updated' });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/tasks/:id/time
router.post('/:id/time', authenticate, async (req, res, next) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: 'Invalid task ID' });

    const { hours, description } = req.body;
    if (!hours || hours <= 0) {
      return res.status(400).json({ success: false, message: 'Hours must be greater than 0' });
    }

    const task = await Task.findOne({ _id: id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const dateStr = today();
    const existing = task.timeEntries.findIndex((e) => e.date === dateStr);
    const entry = { date: dateStr, hours, description: description || '' };
    if (existing >= 0) task.timeEntries[existing] = entry;
    else task.timeEntries.push(entry);

    task.totalTimeSpent = task.timeEntries.reduce((sum, e) => sum + e.hours, 0);
    await task.save();

    res.json({ success: true, task, message: 'Time entry recorded' });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/tasks/:id/daily-update
router.post('/:id/daily-update', authenticate, async (req, res, next) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: 'Invalid task ID' });

    const task = await Task.findOne({ _id: id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const dateStr = today();
    const { workedOn, accomplishments, blockers, nextSteps, mood, progress } = req.body;

    const update = {
      date: dateStr,
      workedOn: workedOn || false,
      status: task.status,
      accomplishments: accomplishments || [],
      blockers: blockers || [],
      nextSteps: nextSteps || [],
      mood: mood || 'neutral'
    };

    const existing = task.dailyUpdates.findIndex((u) => u.date === dateStr);
    if (existing >= 0) task.dailyUpdates[existing] = update;
    else task.dailyUpdates.push(update);

    if (progress !== undefined) {
      task.progress = progress;
      const ph = task.progressHistory.findIndex((h) => h.date === dateStr);
      const phEntry = { date: dateStr, progress, note: (accomplishments || []).join('; ') };
      if (ph >= 0) task.progressHistory[ph] = phEntry;
      else task.progressHistory.push(phEntry);
    }

    await task.save();
    res.json({ success: true, task, message: 'Daily update saved' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
