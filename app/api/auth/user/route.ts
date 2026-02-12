import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/app/lib/db/prisma'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/user
 * Returns the current authenticated user's information
 * Protected by NextAuth
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from NextAuth session
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Try to fetch additional user data from database
    let dbUser = null
    try {
      dbUser = await prisma.user.findUnique({
        where: { email: session.user.email || '' },
        select: {
          id: true,
          email: true,
          name: true,
          companyName: true,
          questionnaireCompleted: true,
        },
      })
    } catch (dbError) {
      console.error('Error fetching user from database:', dbError)
      // Continue with session data only if DB fetch fails
    }

    // Return combined user information (prioritize DB data if available)
    return NextResponse.json({
      user: {
        email: session.user.email,
        id: session.user.id,
        name: dbUser?.name || session.user.name,
        companyName: dbUser?.companyName || null,
        questionnaireCompleted: dbUser?.questionnaireCompleted || false,
      },
    })
  } catch (error) {
    console.error('Error getting user:', error)
    return NextResponse.json(
      { error: 'Failed to get user information' },
      { status: 500 }
    )
  }
}
