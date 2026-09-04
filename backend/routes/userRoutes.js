'use strict';

const express = require('express');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/v1/user/settings
router.get('/settings', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('settings notificationPrefs appPrefs language timezone theme');
    res.json({ success: true, data: user.settings || {} });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/user/settings
router.put('/settings', authenticate, async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { settings: req.body, updatedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, message: 'Settings saved', data: user.settings });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/user/settings/:section
router.patch('/settings/:section', authenticate, async (req, res, next) => {
  try {
    const allowed = ['profile', 'security', 'notifications', 'preferences', 'app'];
    const { section } = req.params;

    if (!allowed.includes(section)) {
      return res.status(400).json({ success: false, message: 'Invalid settings section' });
    }

    const user = await User.findById(req.user._id);
    const current = user.settings || {};
    current[section] = { ...(current[section] || {}), ...req.body };

    user.settings = current;
    user.markModified('settings');
    await user.save();

    res.json({ success: true, message: `${section} settings updated`, data: current[section] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/user/settings
router.delete('/settings', authenticate, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { settings: {} });
    res.json({ success: true, message: 'Settings reset to defaults' });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/user/profile
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: { id: user._id, email: user.email, name: user.name, language: user.language, timezone: user.timezone, theme: user.theme } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/user/profile
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { name, language, timezone, theme } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (language !== undefined) updates.language = language;
    if (timezone !== undefined) updates.timezone = timezone;
    if (theme !== undefined) updates.theme = theme;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated', data: { id: user._id, email: user.email, name: user.name, language: user.language, timezone: user.timezone, theme: user.theme } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/user/password
router.put('/password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required' });
    }

    const User2 = require('../models/User');
    const passwordError = User2.validatePasswordStrength(newPassword);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    const user = await User.findById(req.user._id).select('+password');
    const valid = await user.matchPassword(currentPassword);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
