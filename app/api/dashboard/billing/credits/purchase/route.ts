import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/app/lib/db/prisma'
import { createCheckoutSession } from '@/app/lib/stripe/checkout'

/**
 * POST /api/dashboard/billing/credits/purchase
 * Create a checkout session for purchasing credits
 * Body: { creditAmount: number }
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

    const body = await request.json()
    const { creditAmount } = body

    if (!creditAmount || creditAmount <= 0) {
      return NextResponse.json(
        { error: 'creditAmount must be greater than 0' },
        { status: 400 }
      )
    }

    // Calculate price based on credits (simple 1:1 mapping with cents)
    // E.g., 100 credits = $100
    const priceInCents = creditAmount * 100

    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      userId: user.id,
      type: 'credit_purchase',
      amount: creditAmount, // Will be divided by 100 in checkout
      creditAmount,
      description: `Purchase ${creditAmount} service credits`,
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      creditAmount,
      amount: creditAmount,
    })
  } catch (error) {
    console.error('Error creating credit purchase checkout:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
