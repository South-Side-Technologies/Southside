import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/app/lib/db/prisma'
import { createCheckoutSession } from '@/app/lib/stripe/checkout'

/**
 * POST /api/dashboard/billing/deposits/[id]/checkout
 * Create a checkout session for deposit payment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get deposit
    const deposit = await prisma.deposit.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        userId: true,
        amount: true,
        status: true,
        purpose: true,
      },
    })

    if (!deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 })
    }

    // Check authorization
    if (deposit.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if already paid
    if (deposit.status === 'PAID') {
      return NextResponse.json(
        { error: 'Deposit already paid' },
        { status: 400 }
      )
    }

    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      userId: user.id,
      type: 'deposit',
      depositId: params.id,
      amount: deposit.amount,
      description: deposit.purpose || 'Project deposit',
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })
  } catch (error) {
    console.error('Error creating deposit checkout:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
