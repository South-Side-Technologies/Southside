import { jwtVerify, createRemoteJWKSet } from 'jose'
import type { CloudflareJWTPayload, CloudflareUser } from '../types/auth'

// Cache for Cloudflare public keys (certificates rotate every 6 weeks)
const CERTS_CACHE_KEY = 'cloudflare_certs'
const CERTS_CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

interface CertCache {
  timestamp: number
  jwks: ReturnType<typeof createRemoteJWKSet>
}

let certCache: CertCache | null = null

/**
 * Get Cloudflare's public keys for JWT validation
 * Caches the JWKS for CERTS_CACHE_TTL to reduce fetches
 */
function getCloudflareJWKS() {
  const teamName = process.env.CLOUDFLARE_ACCESS_TEAM_NAME

  if (!teamName) {
    throw new Error('CLOUDFLARE_ACCESS_TEAM_NAME environment variable not set')
  }

  const now = Date.now()

  // Return cached JWKS if still valid
  if (certCache && now - certCache.timestamp < CERTS_CACHE_TTL) {
    return certCache.jwks
  }

  // Create new remote JWKS
  const certsUrl = `https://${teamName}.cloudflareaccess.com/cdn-cgi/access/certs`
  const jwks = createRemoteJWKSet(new URL(certsUrl))

  // Update cache
  certCache = {
    timestamp: now,
    jwks,
  }

  return jwks
}

/**
 * Validate Cloudflare Access JWT token
 * Returns the validated user if successful, throws error if invalid
 *
 * @param token - JWT token from Cf-Access-Jwt-Assertion header
 * @returns Validated user information
 * @throws Error if token is invalid
 */
export async function validateCloudflareJWT(token: string): Promise<CloudflareUser> {
  // Support multiple AUD values for different Cloudflare Access Applications
  const clientAud = process.env.CLOUDFLARE_ACCESS_CLIENT_AUD
  const adminAud = process.env.CLOUDFLARE_ACCESS_ADMIN_AUD

  // For backward compatibility, also check old single AUD variable
  const legacyAud = process.env.CLOUDFLARE_ACCESS_AUD

  // Build array of valid AUD values
  const validAuds = [clientAud, adminAud, legacyAud].filter(Boolean) as string[]

  if (validAuds.length === 0) {
    throw new Error('No Cloudflare Access AUD environment variables set. Set CLOUDFLARE_ACCESS_CLIENT_AUD and/or CLOUDFLARE_ACCESS_ADMIN_AUD')
  }

  try {
    // Get the remote JWKS from Cloudflare
    const JWKS = getCloudflareJWKS()

    // Verify the JWT signature and validate claims
    // jose's jwtVerify accepts an array of audience values
    const { payload } = await jwtVerify<CloudflareJWTPayload>(token, JWKS, {
      audience: validAuds,
      // issuer is optional, but Cloudflare sets it to team name
      // issuer: `https://${process.env.CLOUDFLARE_ACCESS_TEAM_NAME}.cloudflareaccess.com`,
    })

    // Extract user information from validated payload
    const user: CloudflareUser = {
      email: payload.email,
      sub: payload.sub,
      name: payload.name,
      groups: payload.groups, // Cloudflare Access groups
      iat: payload.iat,
      exp: payload.exp,
    }

    return user
  } catch (error) {
    // Log error details for debugging
    console.error('JWT validation failed:', error)

    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw new Error(`Invalid JWT: ${error.message}`)
    }

    throw new Error('Invalid JWT: Unknown error')
  }
}

/**
 * Extract JWT token from request headers or cookies
 * Cloudflare Access sets the token in multiple places
 *
 * @param headers - Request headers object
 * @param cookies - Request cookies object (optional)
 * @returns JWT token string or null if not found
 */
export function extractJWTFromRequest(
  headers: Headers,
  cookies?: { get: (name: string) => { value: string } | undefined }
): string | null {
  // Primary: Check Cf-Access-Jwt-Assertion header
  const jwtHeader = headers.get('Cf-Access-Jwt-Assertion')
  if (jwtHeader) {
    return jwtHeader
  }

  // Secondary: Check CF_Authorization cookie
  if (cookies) {
    const jwtCookie = cookies.get('CF_Authorization')
    if (jwtCookie?.value) {
      return jwtCookie.value
    }
  }

  return null
}

/**
 * Clear the certificate cache (useful for testing or forced refresh)
 */
export function clearCertCache() {
  certCache = null
}
