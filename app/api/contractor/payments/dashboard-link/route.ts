import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { requireContractor } from '@/app/lib/auth/roles'
import { prisma } from '@/app/lib/db/prisma'
import { createDashboardLink } from '@/app/lib/stripe/connect'

/**
 * GET /api/contractor/payments/dashboard-link
 * Get a login link to the Stripe Connect dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    requireContractor(session.user)

    // Get user's Stripe Connect account ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        stripeConnectAccountId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.stripeConnectAccountId) {
      return NextResponse.json(
        { error: 'Stripe Connect account not set up' },
        { status: 400 }
      )
    }

    // Create dashboard login link
    const linkResult = await createDashboardLink(user.stripeConnectAccountId)

    if (!linkResult.success) {
      return NextResponse.json({ error: linkResult.error }, { status: 500 })
    }

    return NextResponse.json({
      dashboardUrl: linkResult.url,
    })
  } catch (error: any) {
    console.error('Error getting dashboard link:', error)
    return NextResponse.json(
      { error: 'Failed to get dashboard link' },
      { status: 500 }
    )
  }
}
