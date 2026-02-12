/**
 * Authentication types for Cloudflare Access integration
 */

export interface CloudflareUser {
  email: string
  sub: string // user ID from identity provider
  name?: string
  groups?: string[] // Cloudflare Access groups (e.g., ['admins'] or ['clients'])
  iat?: number // issued at
  exp?: number // expiration
}

export interface CloudflareJWTPayload {
  aud: string[] | string // audience
  email: string
  sub: string
  iat: number
  exp: number
  name?: string
  groups?: string[] // Cloudflare Access groups
  // Additional claims that might be present
  [key: string]: unknown
}

export interface CloudflarePublicKey {
  kid: string // key ID
  use: string
  kty: string
  n: string
  e: string
  alg: string
}

export interface CloudflarePublicKeys {
  keys: CloudflarePublicKey[]
  public_certs?: Array<{
    kid: string
    cert: string
  }>
}

export interface JWTValidationResult {
  valid: boolean
  user?: CloudflareUser
  error?: string
}
