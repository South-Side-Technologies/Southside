import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/app/lib/db/prisma'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/check-account
 * Checks if the authenticated user has an account in the database
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from NextAuth session
    const session = await getServerSession(authOptions)

    console.log('Check account - Session user:', session?.user?.email)

    if (!session?.user?.email) {
      console.log('Check account - No authenticated user found')
      return NextResponse.json(
        { error: 'Not authenticated', hasAccount: false },
        { status: 401 }
      )
    }

    // Check if user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    console.log('Check account - DB user found:', !!dbUser, 'for email:', session.user.email)

    return NextResponse.json({
      hasAccount: !!dbUser,
      email: session.user.email,
    })
  } catch (error) {
    console.error('Error checking account:', error)
    return NextResponse.json(
      { error: 'Failed to check account', hasAccount: false },
      { status: 500 }
    )
  }
}
