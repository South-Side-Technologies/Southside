import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { requireContractor } from '@/app/lib/auth/roles'
import { prisma } from '@/app/lib/db/prisma'
import { checkOnboardingStatus } from '@/app/lib/stripe/connect'

/**
 * GET /api/contractor/payments/status
 * Check contractor Stripe Connect onboarding status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    requireContractor(session.user)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        stripeConnectAccountId: true,
        stripeOnboardingComplete: true,
      },
    })

    if (!user || !user.stripeConnectAccountId) {
      return NextResponse.json({
        onboardingStarted: false,
        onboardingComplete: false,
      })
    }

    // Check status with Stripe
    const statusResult = await checkOnboardingStatus(user.stripeConnectAccountId)

    if (!statusResult.success) {
      return NextResponse.json({
        onboardingStarted: true,
        onboardingComplete: false,
        error: statusResult.error,
      })
    }

    // If charges and payouts are enabled, mark as complete
    const isComplete = statusResult.chargesEnabled && statusResult.payoutsEnabled

    // Update database if status changed
    if (isComplete && !user.stripeOnboardingComplete) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeOnboardingComplete: true },
      })
    }

    return NextResponse.json({
      onboardingStarted: true,
      onboardingComplete: isComplete,
      chargesEnabled: statusResult.chargesEnabled,
      payoutsEnabled: statusResult.payoutsEnabled,
      detailsSubmitted: statusResult.detailsSubmitted,
      requirementsNeeded: statusResult.requirementsNeeded,
    })
  } catch (error: any) {
    console.error('Error checking onboarding status:', error)
    return NextResponse.json(
      { error: 'Failed to check onboarding status' },
      { status: 500 }
    )
  }
}
