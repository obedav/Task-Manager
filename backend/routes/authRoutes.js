'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const blacklist = require('../utils/tokenBlacklist');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/'
};

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const ACCESS_COOKIE_MAX_AGE  = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const signAccess = (user) =>
  jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL
  });

const signRefresh = (user) =>
  jwt.sign({ id: user._id, type: 'refresh' }, process.env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL
  });

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: ACCESS_COOKIE_MAX_AGE });
  res.cookie('refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: REFRESH_COOKIE_MAX_AGE });
};

const clearAuthCookies = (res) => {
  res.clearCookie('access_token', COOKIE_OPTIONS);
  res.clearCookie('refresh_token', COOKIE_OPTIONS);
};

const safeUser = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name,
  role: user.role,
  language: user.language,
  timezone: user.timezone,
  theme: user.theme,
  notificationPrefs: user.notificationPrefs,
  createdAt: user.createdAt
});

// POST /api/v1/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const passwordError = User.validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password });

    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({ success: true, message: 'Account created successfully', user: safeUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    const valid = user && await user.matchPassword(password);

    if (!valid) {
      // Same message for both cases to avoid user enumeration
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.json({ success: true, message: 'Login successful', user: safeUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/logout
router.post('/logout', authenticate, (req, res) => {
  const { token, tokenDecoded } = req;
  if (token && tokenDecoded?.exp) {
    blacklist.add(token, tokenDecoded.exp);
  }
  clearAuthCookies(res);
  res.json({ success: true, message: 'Logged out successfully' });
});

// POST /api/v1/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    if (blacklist.has(refreshToken)) {
      return res.status(401).json({ success: false, message: 'Refresh token has been revoked' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch {
      clearAuthCookies(res);
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ success: false, message: 'Invalid token type' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    // Rotate tokens
    blacklist.add(refreshToken, decoded.exp);
    const newAccess = signAccess(user);
    const newRefresh = signRefresh(user);
    setAuthCookies(res, newAccess, newRefresh);

    res.json({ success: true, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/auth/profile
router.get('/profile', authenticate, (req, res) => {
  res.json({ success: true, user: safeUser(req.user) });
});

// PUT /api/v1/auth/profile
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { name, language, timezone, theme } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name.trim();
    if (language !== undefined) updates.language = language;
    if (timezone !== undefined) updates.timezone = timezone;
    if (theme !== undefined) updates.theme = theme;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated', user: safeUser(user) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/auth/password
router.put('/password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }

    const passwordError = User.validatePasswordStrength(newPassword);
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

    // Revoke current session so they must re-login with new password
    if (req.token && req.tokenDecoded?.exp) {
      blacklist.add(req.token, req.tokenDecoded.exp);
    }
    clearAuthCookies(res);

    res.json({ success: true, message: 'Password changed. Please log in again.' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/auth/notifications
router.put('/notifications', authenticate, async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificationPrefs: req.body },
      { new: true }
    );
    res.json({ success: true, message: 'Notification preferences updated', notificationPrefs: user.notificationPrefs });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/export
router.post('/export', authenticate, async (req, res, next) => {
  try {
    const Task = require('../models/Task');
    const { format } = req.body;
    const tasks = await Task.find({ user: req.user._id }).lean();

    const payload = {
      user: safeUser(req.user),
      tasks,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };

    if (format === 'csv') {
      const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Progress', 'Created', 'Due Date'];
      const rows = tasks.map((t) => [
        t._id, `"${t.title}"`, `"${t.description || ''}"`,
        t.status, t.priority, t.progress,
        t.createdAt, t.dueDate || ''
      ].join(','));
      return res.json({ success: true, data: [headers.join(','), ...rows].join('\n') });
    }

    res.json({ success: true, data: JSON.stringify(payload, null, 2) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
