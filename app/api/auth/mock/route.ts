import { getServerSession } from 'next-auth'
import { authOptions } from '../[...nextauth]/route'
import prisma from '../../../lib/db/prisma'
import { ADMIN_EMAILS } from '../../../lib/auth/roles'

// This endpoint is only for testing purposes
// It bypasses Google OAuth and creates/logs in a test user directly

export async function POST(request: Request) {
  // Check if mock auth is enabled via environment variable or query parameter
  const url = new URL(request.url)
  const testMode = url.searchParams.get('testMode') === 'true'
  const isMockAuthEnabled = process.env.MOCK_AUTH_ENABLED === 'true' || testMode

  if (!isMockAuthEnabled) {
    return new Response('Mock auth not enabled', { status: 403 })
  }

  try {
    const { email = 'test@example.com', name = 'Test User' } = await request.json()

    // Validate test email format
    if (!email.includes('@')) {
      return new Response('Invalid email', { status: 400 })
    }

    // Create or update test user in database
    const isAdmin = ADMIN_EMAILS.includes(email)

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        emailVerified: new Date(),
      },
      create: {
        email,
        name,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        role: isAdmin ? 'ADMIN' : 'CLIENT',
        roles: isAdmin ? ['ADMIN'] : ['CLIENT'],
        emailVerified: new Date(),
      },
    })

    // Use NextAuth's built-in JWT/session mechanism
    // Return success response - the client will handle navigation
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles || [user.role],
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[Mock Auth] Error:', error)
    return new Response('Authentication failed', { status: 500 })
  }
}
