import type { CloudflareUser } from '../types/auth'

/**
 * Check if user is authenticated
 *
 * @param user - User object or null
 * @returns True if user is authenticated
 */
export function isAuthenticated(user: CloudflareUser | null): user is CloudflareUser {
  return user !== null && !!user.email && !!user.sub
}

/**
 * Check if JWT token is expired
 *
 * @param exp - Expiration timestamp from JWT
 * @returns True if token is expired
 */
export function isTokenExpired(exp?: number): boolean {
  if (!exp) {
    return true
  }

  const now = Math.floor(Date.now() / 1000) // Current time in seconds
  return now >= exp
}

/**
 * Get time until token expires in seconds
 *
 * @param exp - Expiration timestamp from JWT
 * @returns Seconds until expiration, or 0 if expired/invalid
 */
export function getTimeUntilExpiration(exp?: number): number {
  if (!exp) {
    return 0
  }

  const now = Math.floor(Date.now() / 1000)
  const timeRemaining = exp - now

  return Math.max(0, timeRemaining)
}

/**
 * Format time remaining until expiration as human-readable string
 *
 * @param exp - Expiration timestamp from JWT
 * @returns Human-readable time string (e.g., "2 hours", "30 minutes")
 */
export function formatExpirationTime(exp?: number): string {
  const seconds = getTimeUntilExpiration(exp)

  if (seconds === 0) {
    return 'Expired'
  }

  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`
  }

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }

  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }

  return `${seconds} second${seconds > 1 ? 's' : ''}`
}

/**
 * Get user display name (prefers name, falls back to email)
 *
 * @param user - User object
 * @returns Display name for user
 */
export function getUserDisplayName(user: CloudflareUser | null): string {
  if (!user) {
    return 'Guest'
  }

  return user.name || user.email
}

/**
 * Get user initials from name or email
 *
 * @param user - User object
 * @returns User initials (e.g., "JD" for "John Doe")
 */
export function getUserInitials(user: CloudflareUser | null): string {
  if (!user) {
    return '?'
  }

  const name = user.name || user.email

  // Split by space and take first letter of first two words
  const words = name.trim().split(/\s+/)

  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }

  // If only one word or email, take first two letters
  return name.slice(0, 2).toUpperCase()
}

/**
 * Mask email for privacy (e.g., "j***@example.com")
 *
 * @param email - Email address
 * @returns Masked email string
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')

  if (!local || !domain) {
    return email
  }

  const masked = local[0] + '***'
  return `${masked}@${domain}`
}
