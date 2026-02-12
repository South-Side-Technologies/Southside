import type { User } from '@prisma/client'

/**
 * Admin emails - hardcoded bootstrap admin
 * This user will ALWAYS be admin regardless of database role
 */
export const ADMIN_EMAILS = ['zonatedace@gmail.com']

/**
 * Check if a user is an admin
 * A user is an admin if:
 * 1. Their email is in the ADMIN_EMAILS list, OR
 * 2. Their database roles array includes ADMIN
 *
 * @param user - User from database or session
 * @returns true if user is an admin
 */
export function isAdmin(user: Pick<User, 'email' | 'roles'> | null | undefined): boolean {
  if (!user) return false

  // Bootstrap admin check
  if (ADMIN_EMAILS.includes(user.email)) return true

  // Database role check - support both old 'role' and new 'roles' fields for migration
  const roles = Array.isArray(user.roles) ? user.roles : [user.roles]
  return roles.includes('ADMIN')
}

/**
 * Check if a user is a contractor
 *
 * @param user - User from database or session
 * @returns true if user is a contractor
 */
export function isContractor(user: Pick<User, 'roles'> | null | undefined): boolean {
  if (!user) return false
  const roles = Array.isArray(user.roles) ? user.roles : [user.roles]
  return roles.includes('CONTRACTOR')
}

/**
 * Check if a user is a client (regular customer)
 *
 * @param user - User from database or session
 * @returns true if user is a client
 */
export function isClient(user: Pick<User, 'roles'> | null | undefined): boolean {
  if (!user) return false
  const roles = Array.isArray(user.roles) ? user.roles : [user.roles]
  return roles.includes('CLIENT')
}

/**
 * Get the user's roles as an array
 * Users can have multiple roles (e.g., both ADMIN and CONTRACTOR)
 *
 * @param user - User from database or session
 * @returns array of roles the user has
 */
export function getUserRoles(user: Pick<User, 'roles'> | null | undefined): string[] {
  if (!user || !user.roles) return []
  return Array.isArray(user.roles) ? user.roles : [user.roles]
}

/**
 * Get the user's primary role (for display purposes)
 * Priority: admin > contractor > client
 *
 * @param user - User from database or session
 * @returns 'admin' | 'contractor' | 'client' | 'unknown'
 */
export function getUserRole(user: Pick<User, 'email' | 'roles'> | null | undefined): 'admin' | 'contractor' | 'client' | 'unknown' {
  if (!user) return 'unknown'

  if (isAdmin(user)) return 'admin'
  if (isContractor(user)) return 'contractor'
  if (isClient(user)) return 'client'

  return 'unknown'
}

/**
 * Require admin access - throws error if user is not an admin
 *
 * @param user - User from database or session
 * @throws Error if user is not an admin
 */
export function requireAdmin(user: any): asserts user {
  if (!user) {
    throw new Error('Authentication required')
  }

  if (!isAdmin(user)) {
    throw new Error('Admin access required')
  }
}

/**
 * Require contractor access - throws error if user is not a contractor
 *
 * @param user - User from database or session
 * @throws Error if user is not a contractor
 */
export function requireContractor(user: any): asserts user {
  if (!user) {
    throw new Error('Authentication required')
  }

  if (!isContractor(user)) {
    throw new Error('Contractor access required')
  }
}

/**
 * Require client access - throws error if user is not a client
 *
 * @param user - User from database or session
 * @throws Error if user is not a client
 */
export function requireClient(user: any): asserts user {
  if (!user) {
    throw new Error('Authentication required')
  }

  if (!isClient(user)) {
    throw new Error('Client access required')
  }
}
