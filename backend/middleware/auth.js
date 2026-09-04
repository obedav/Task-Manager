'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const blacklist = require('../utils/tokenBlacklist');

/**
 * Resolves the raw JWT from the request.
 * Priority: httpOnly cookie → Authorization: Bearer header (for legacy clients / Postman).
 */
const extractToken = (req) => {
  if (req.cookies?.access_token) return req.cookies.access_token;
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
};

/**
 * Authenticate middleware – attaches req.user (Mongoose doc minus password).
 * Rejects revoked tokens via the blacklist.
 */
const authenticate = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (blacklist.has(token)) {
    return res.status(401).json({ success: false, message: 'Token has been revoked' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Token has expired'
      : 'Invalid token';
    return res.status(401).json({ success: false, message });
  }

  try {
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    req.user = user;
    req.token = token;
    req.tokenDecoded = decoded;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Admin-only guard – must be used after `authenticate`.
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
