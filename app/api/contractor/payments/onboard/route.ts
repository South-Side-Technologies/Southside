import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { requireContractor } from '@/app/lib/auth/roles'
import { prisma } from '@/app/lib/db/prisma'
import { createConnectAccount, createOnboardingLink } from '@/app/lib/stripe/connect'

/**
 * POST /api/contractor/payments/onboard
 * Start contractor Stripe Connect onboarding
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!session.user.roles?.includes('CONTRACTOR')) {
      return NextResponse.json({ error: 'Contractor access required' }, { status: 403 })
    }

    // Get current user to check if they already have a Connect account
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        stripeConnectAccountId: true,
        stripeOnboardingComplete: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If they already have a Connect account, create a new onboarding link
    let accountId = user.stripeConnectAccountId

    if (!accountId) {
      // Create new Connect account
      const accountResult = await createConnectAccount(user.email!, user.name || undefined)

      if (!accountResult.success) {
        console.error('Failed to create Connect account:', accountResult.error)
        return NextResponse.json({ error: `Stripe account creation failed: ${accountResult.error}` }, { status: 500 })
      }

      accountId = accountResult.accountId

      // Save account ID to database
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeConnectAccountId: accountId },
      })
    }

    // Create onboarding link
    const linkResult = await createOnboardingLink(accountId!)

    if (!linkResult.success) {
      console.error('Failed to create onboarding link:', linkResult.error)
      return NextResponse.json({ error: `Onboarding link creation failed: ${linkResult.error}` }, { status: 500 })
    }

    return NextResponse.json({
      onboardingUrl: linkResult.url,
    })
  } catch (error: any) {
    console.error('Error starting onboarding:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to start onboarding' },
      { status: 500 }
    )
  }
}
