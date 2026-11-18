'use strict';

/**
 * Token blacklist backed by MongoDB with an in-memory cache layer.
 * - In-memory cache: O(1) lookup for tokens revoked in the current process
 * - MongoDB: persistence across restarts and multi-instance deployments
 * - TTL index on RevokedToken.expiresAt: MongoDB auto-purges expired docs
 */
const RevokedToken = require('../models/RevokedToken');

const cache = new Map();

const pruneCache = () => {
  const now = Date.now();
  for (const [token, expiresAt] of cache) {
    if (expiresAt <= now) cache.delete(token);
  }
};

const pruneTimer = setInterval(pruneCache, 15 * 60 * 1000);
pruneTimer.unref?.();

/**
 * Revoke a token until its natural expiry.
 * @param {string} token  - Raw JWT string
 * @param {number} expSec - Token `exp` claim (seconds since Unix epoch)
 */
const add = async (token, expSec) => {
  const expiresAtMs = expSec * 1000;
  cache.set(token, expiresAtMs);
  try {
    await RevokedToken.create({ token, expiresAt: new Date(expiresAtMs) });
  } catch (err) {
    // Duplicate key (token already revoked) — safe to ignore
    if (err.code !== 11000) console.error('tokenBlacklist.add error:', err.message);
  }
};

/**
 * Check if a token has been revoked.
 * @param {string} token
 * @returns {Promise<boolean>}
 */
const has = async (token) => {
  // Fast path: in-memory cache
  const cached = cache.get(token);
  if (cached !== undefined) {
    if (cached > Date.now()) return true;
    cache.delete(token);
    return false;
  }
  // Slow path: DB (covers tokens revoked by other instances or before restart)
  try {
    const doc = await RevokedToken.findOne({ token }).lean();
    if (doc) {
      cache.set(token, doc.expiresAt.getTime()); // warm the cache
      return true;
    }
  } catch (err) {
    console.error('tokenBlacklist.has error:', err.message);
  }
  return false;
};

module.exports = { add, has };
