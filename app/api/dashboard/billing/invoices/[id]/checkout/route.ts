import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/app/lib/db/prisma'
import { createCheckoutSession } from '@/app/lib/stripe/checkout'
import { applyCreditsToInvoice } from '@/app/lib/stripe/invoices'

/**
 * POST /api/dashboard/billing/invoices/[id]/checkout
 * Create a checkout session for invoice payment
 * Body: { useCredits?: boolean }
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

    // Get invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        userId: true,
        amount: true,
        status: true,
        invoiceNumber: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Check authorization
    if (invoice.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if already paid
    if (invoice.status === 'PAID') {
      return NextResponse.json(
        { error: 'Invoice already paid' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { useCredits } = body

    // If paying with credits
    if (useCredits) {
      try {
        await applyCreditsToInvoice(params.id, user.id)
        return NextResponse.json({
          success: true,
          method: 'credits',
          message: 'Invoice paid with credits',
        })
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message || 'Failed to apply credits' },
          { status: 400 }
        )
      }
    }

    // Create checkout session for card payment
    const checkoutSession = await createCheckoutSession({
      userId: user.id,
      type: 'invoice',
      invoiceId: params.id,
      amount: invoice.amount,
      description: `Invoice ${invoice.invoiceNumber}`,
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
