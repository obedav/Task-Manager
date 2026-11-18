'use strict';

const router = require('express').Router();
const User = require('../models/User');
const Task = require('../models/Task');
const Subscription = require('../models/Subscription');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);

// GET /api/v1/admin/stats — platform-wide totals
router.get('/stats', async (req, res, next) => {
  try {
    const [totalUsers, totalTasks, subscriptions] = await Promise.all([
      User.countDocuments(),
      Task.countDocuments(),
      Subscription.find({}, 'plan status').lean()
    ]);

    const subByPlan = { free: 0, pro: 0, team: 0 };
    subscriptions.forEach(s => {
      if (subByPlan[s.plan] !== undefined) subByPlan[s.plan]++;
    });

    const completedTasks = await Task.countDocuments({ status: 'completed' });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTasks,
        completedTasks,
        subscriptions: subByPlan
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/users?page=1&limit=20&search=
router.get('/users', async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;
    const search = req.query.search?.trim();

    const filter = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter, 'name email role createdAt').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter)
    ]);

    const userIds = users.map(u => u._id);
    const [taskCounts, subs] = await Promise.all([
      Task.aggregate([
        { $match: { user: { $in: userIds } } },
        { $group: { _id: '$user', count: { $sum: 1 } } }
      ]),
      Subscription.find({ user: { $in: userIds } }, 'user plan status').lean()
    ]);

    const taskMap = Object.fromEntries(taskCounts.map(t => [t._id.toString(), t.count]));
    const subMap  = Object.fromEntries(subs.map(s => [s.user.toString(), { plan: s.plan, status: s.status }]));

    const enriched = users.map(u => ({
      ...u,
      taskCount:    taskMap[u._id.toString()]  ?? 0,
      subscription: subMap[u._id.toString()]   ?? { plan: 'free', status: 'active' }
    }));

    res.json({
      success: true,
      data: enriched,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/admin/users/:id/role — promote/demote
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be "user" or "admin"' });
    }
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot change your own role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, select: 'name email role' });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
