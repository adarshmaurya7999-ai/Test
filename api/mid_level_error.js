/**
 * Mid-level HTTP API errors and semantic response testing (e.g. Validation, Auth, Rate Limits, Conflicts).
 */

// Simple local counter for rate limiting simulation
let rateLimitRequestCount = 0;
// Simple toggle for conflict simulation
let resourceVersion = 1;

/**
 * 1. Validation Error
 * Expects { username: string, email: string, age: number (>= 18) }
 */
function validateUserData(data) {
  const errors = [];
  if (!data.username || typeof data.username !== 'string' || data.username.length < 3) {
    errors.push({ field: 'username', message: 'Username must be a string of at least 3 characters.' });
  }
  if (!data.email || !data.email.includes('@')) {
    errors.push({ field: 'email', message: 'Email address is invalid.' });
  }
  if (data.age === undefined || typeof data.age !== 'number' || data.age < 18) {
    errors.push({ field: 'age', message: 'User must be a registered adult (age >= 18).' });
  }
  return errors;
}

/**
 * 2. Auth Errors simulation
 */
function verifyAuthToken(authHeader) {
  if (!authHeader) {
    return { error: 'Authentication token required.', status: 401 };
  }
  if (authHeader === 'Bearer EXPIRED_TOKEN') {
    return { error: 'The provided authentication token has expired.', status: 401 };
  }
  if (authHeader === 'Bearer USER_TOKEN') {
    // Authorized but doesn't have permissions
    return { error: 'Insufficient permissions. Requester must have an administrative role.', status: 403 };
  }
  return { authorized: true };
}

/**
 * 3. Rate Limiter simulation
 */
function checkRateLimit() {
  rateLimitRequestCount++;
  // Every 3rd request to this endpoint returns a 429
  if (rateLimitRequestCount % 3 === 0) {
    return { error: 'Too many requests. Please slow down.', status: 429, retryAfter: 15 };
  }
  return { success: true, count: rateLimitRequestCount };
}

/**
 * 4. Conflict simulation (Optimistic locking or resource already exists)
 */
function updateResource(submittedVersion) {
  if (submittedVersion !== resourceVersion) {
    return {
      status: 409,
      error: 'Conflict: The resource has been modified by another process. Please reload and try again.',
      currentVersion: resourceVersion
    };
  }
  resourceVersion++;
  return { success: true, newVersion: resourceVersion };
}

module.exports = {
  validateUserData,
  verifyAuthToken,
  checkRateLimit,
  updateResource
};
