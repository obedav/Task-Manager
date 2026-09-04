'use strict';

/**
 * In-memory token blacklist for logout revocation.
 * Stores { token: expiresAt } pairs and prunes expired entries periodically.
 * For multi-instance deployments, swap this for a Redis SET with TTL.
 */
const blacklist = new Map();

const PRUNE_INTERVAL_MS = 15 * 60 * 1000; // prune every 15 min

const pruneExpired = () => {
  const now = Date.now();
  for (const [token, expiresAt] of blacklist) {
    if (expiresAt <= now) blacklist.delete(token);
  }
};

// Run pruner on a recurring interval (won't block shutdown – it's non-ref'd)
const pruneTimer = setInterval(pruneExpired, PRUNE_INTERVAL_MS);
pruneTimer.unref?.();

/**
 * Add a token to the blacklist until its natural expiry.
 * @param {string} token  - JWT string
 * @param {number} expSec - Token `exp` claim (seconds since epoch)
 */
const add = (token, expSec) => {
  blacklist.set(token, expSec * 1000);
};

/**
 * Return true if the token has been revoked.
 * @param {string} token
 * @returns {boolean}
 */
const has = (token) => {
  const expiresAt = blacklist.get(token);
  if (expiresAt === undefined) return false;
  if (expiresAt <= Date.now()) {
    blacklist.delete(token);
    return false;
  }
  return true;
};

module.exports = { add, has };
