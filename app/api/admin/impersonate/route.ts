import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/app/lib/db/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/impersonate
 * Impersonate a user (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Get current admin user
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // TODO: Add admin role check here
    // For now, any authenticated user can impersonate

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Get the user to impersonate
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Store impersonation in cookie
    const cookieStore = await cookies()

    // Store the original admin's ID so we can switch back
    cookieStore.set('impersonate_original_id', session.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    // Store the full impersonated user data (to avoid database query in middleware)
    const impersonateData = JSON.stringify({
      email: targetUser.email,
      id: targetUser.id,
      name: targetUser.name,
    })

    cookieStore.set('impersonate_user_data', impersonateData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return NextResponse.json({
      success: true,
      message: `Now impersonating ${targetUser.email}`,
    })
  } catch (error) {
    console.error('Error impersonating user:', error)
    return NextResponse.json(
      { error: 'Failed to impersonate user' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/impersonate
 * Stop impersonating and return to original admin account
 */
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    // Remove impersonation cookies
    cookieStore.delete('impersonate_user_data')
    cookieStore.delete('impersonate_original_id')

    return NextResponse.json({
      success: true,
      message: 'Stopped impersonating',
    })
  } catch (error) {
    console.error('Error stopping impersonation:', error)
    return NextResponse.json(
      { error: 'Failed to stop impersonation' },
      { status: 500 }
    )
  }
}
