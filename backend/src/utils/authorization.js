import { AuthorizationError } from './errors.js';

/**
 * Authorization helper functions
 * Centralizes ownership and permission checking logic
 */

/**
 * Check if user is owner of resource or has admin role
 *
 * @param {Object} resource - Resource with userId property
 * @param {Object} user - User object from req.user
 * @param {string} errorMessage - Custom error message (optional)
 * @throws {AuthorizationError} If user is not owner and not admin
 */
export function requireOwnershipOrAdmin(resource, user, errorMessage = 'Access denied') {
  if (!resource) {
    throw new AuthorizationError('Resource not found');
  }

  if (!user) {
    throw new AuthorizationError('Authentication required');
  }

  const isOwner = resource.userId === user.id;
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AuthorizationError(errorMessage);
  }

  return true;
}

/**
 * Check if user has admin role
 *
 * @param {Object} user - User object from req.user
 * @throws {AuthorizationError} If user is not admin
 */
export function requireAdmin(user) {
  if (!user) {
    throw new AuthorizationError('Authentication required');
  }

  if (user.role !== 'admin') {
    throw new AuthorizationError('Admin access required');
  }

  return true;
}

/**
 * Check if user owns resource
 *
 * @param {Object} resource - Resource with userId property
 * @param {Object} user - User object from req.user
 * @throws {AuthorizationError} If user is not owner
 */
export function requireOwnership(resource, user) {
  if (!resource) {
    throw new AuthorizationError('Resource not found');
  }

  if (!user) {
    throw new AuthorizationError('Authentication required');
  }

  if (resource.userId !== user.id) {
    throw new AuthorizationError('You do not have permission to access this resource');
  }

  return true;
}

/**
 * Scope query to user's resources (unless admin)
 * Use this to automatically filter queries for non-admin users
 *
 * @param {Object} where - Existing where clause
 * @param {Object} user - User object from req.user
 * @param {boolean} forceUserScope - Force user scope even for admins
 * @returns {Object} Updated where clause
 */
export function scopeToUser(where = {}, user, forceUserScope = false) {
  if (!user) {
    throw new AuthorizationError('Authentication required');
  }

  // Admins see all resources (unless forced)
  if (!forceUserScope && user.role === 'admin') {
    return where;
  }

  // Non-admins only see their own resources
  return {
    ...where,
    userId: user.id
  };
}
