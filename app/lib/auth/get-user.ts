import type { CloudflareUser } from '../types/auth'
import { validateCloudflareJWT, extractJWTFromRequest } from './validate-jwt'

/**
 * Get the current user from request headers
 * Middleware sets X-User-Email and X-User-Id after JWT validation
 *
 * @param headers - Request headers
 * @returns User object or null if not authenticated
 */
export function getUserFromHeaders(headers: Headers): CloudflareUser | null {
  const email = headers.get('X-User-Email')
  const sub = headers.get('X-User-Id')
  const name = headers.get('X-User-Name')

  if (!email || !sub) {
    return null
  }

  return {
    email,
    sub,
    name: name || undefined,
  }
}

/**
 * Get and validate user from JWT token in request
 * Use this when you need to validate the JWT directly instead of relying on middleware
 *
 * @param headers - Request headers
 * @param cookies - Request cookies (optional)
 * @returns Validated user object or null if not authenticated
 */
export async function getUserFromJWT(
  headers: Headers,
  cookies?: { get: (name: string) => { value: string } | undefined }
): Promise<CloudflareUser | null> {
  const token = extractJWTFromRequest(headers, cookies)

  if (!token) {
    return null
  }

  try {
    const user = await validateCloudflareJWT(token)
    return user
  } catch (error) {
    console.error('Failed to get user from JWT:', error)
    return null
  }
}

/**
 * Get current user - tries headers first (set by middleware), then validates JWT
 * Use this as the primary method to get user in server components and API routes
 *
 * @param headers - Request headers
 * @param cookies - Request cookies (optional)
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(
  headers: Headers,
  cookies?: { get: (name: string) => { value: string } | undefined }
): Promise<CloudflareUser | null> {
  // First, try to get user from headers (set by middleware)
  const userFromHeaders = getUserFromHeaders(headers)
  if (userFromHeaders) {
    return userFromHeaders
  }

  // If not in headers, validate JWT directly
  return getUserFromJWT(headers, cookies)
}

/**
 * Require authentication - throws error if user is not authenticated
 * Use this in API routes that require authentication
 *
 * @param headers - Request headers
 * @param cookies - Request cookies (optional)
 * @returns Validated user object
 * @throws Error if not authenticated
 */
export async function requireAuth(
  headers: Headers,
  cookies?: { get: (name: string) => { value: string } | undefined }
): Promise<CloudflareUser> {
  const user = await getCurrentUser(headers, cookies)

  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}
