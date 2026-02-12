import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getCheckoutSession } from '@/app/lib/stripe/checkout'

/**
 * GET /api/checkout/verify?session_id=xxx
 * Verify a checkout session was completed successfully
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      )
    }

    // Get checkout session from Stripe
    const checkoutSession = await getCheckoutSession(sessionId)

    if (!checkoutSession) {
      return NextResponse.json(
        { error: 'Checkout session not found' },
        { status: 404 }
      )
    }

    // Verify session belongs to user
    if (checkoutSession.metadata?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if payment was successful
    if (checkoutSession.payment_status === 'paid') {
      return NextResponse.json({
        success: true,
        message: 'Payment completed successfully',
        sessionId,
        paymentType: checkoutSession.metadata?.type,
      })
    } else if (checkoutSession.payment_status === 'unpaid') {
      return NextResponse.json(
        { error: 'Payment not completed', success: false },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Checkout session verified',
      status: checkoutSession.payment_status,
    })
  } catch (error) {
    console.error('Error verifying checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    )
  }
}
