import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/app/lib/db/prisma'
import { createCheckoutSession } from '@/app/lib/stripe/checkout'

/**
 * POST /api/dashboard/billing/subscription/checkout
 * Create a checkout session for subscription
 * Body: { priceId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get existing subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    })

    if (existingSubscription && existingSubscription.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { priceId } = body

    if (!priceId) {
      return NextResponse.json(
        { error: 'priceId is required' },
        { status: 400 }
      )
    }

    // Create checkout session for subscription
    const checkoutSession = await createCheckoutSession({
      userId: user.id,
      type: 'subscription',
      priceId,
      description: 'Subscribe to service plan',
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
