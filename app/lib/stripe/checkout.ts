import { stripe } from './client'
import { getOrCreateStripeCustomer } from './customers'
import prisma from '@/app/lib/db/prisma'

export interface CheckoutSessionParams {
  userId: string
  type: 'invoice' | 'subscription' | 'deposit' | 'credit_purchase'
  amount?: number
  currency?: string
  description?: string
  metadata?: Record<string, string>

  // Invoice-specific
  invoiceId?: string

  // Subscription-specific
  priceId?: string

  // Deposit-specific
  depositId?: string

  // Credit purchase-specific
  creditAmount?: number
}

/**
 * Create a Stripe Checkout Session for various payment types
 */
export async function createCheckoutSession(params: CheckoutSessionParams) {
  const {
    userId,
    type,
    amount = 0,
    currency = 'usd',
    description,
    metadata = {},
    invoiceId,
    priceId,
    depositId,
    creditAmount,
  } = params

  // Get or create Stripe customer
  const customerId = await getOrCreateStripeCustomer(userId)

  const baseMetadata = {
    userId,
    type,
    ...metadata,
  }

  let sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    metadata: baseMetadata,
    success_url: `${process.env.NEXTAUTH_URL}/dashboard/billing/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/billing`,
    allow_promotion_codes: true,
  }

  if (type === 'invoice') {
    if (!invoiceId || !amount) {
      throw new Error('invoiceId and amount are required for invoice checkout')
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { id: true, amount: true, invoiceNumber: true, userId: true },
    })

    if (!invoice || invoice.userId !== userId) {
      throw new Error('Invoice not found or unauthorized')
    }

    sessionParams.line_items = [
      {
        price_data: {
          currency,
          product_data: {
            name: `Invoice ${invoice.invoiceNumber}`,
            description: description || `Payment for invoice ${invoice.invoiceNumber}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ]
    sessionParams.mode = 'payment'
    baseMetadata.invoiceId = invoiceId

  } else if (type === 'subscription') {
    if (!priceId) {
      throw new Error('priceId is required for subscription checkout')
    }

    sessionParams.line_items = [
      {
        price: priceId,
        quantity: 1,
      },
    ]
    sessionParams.mode = 'subscription'
    baseMetadata.priceId = priceId

  } else if (type === 'deposit') {
    if (!depositId || !amount) {
      throw new Error('depositId and amount are required for deposit checkout')
    }

    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      select: { id: true, amount: true, userId: true, project: { select: { name: true } } },
    })

    if (!deposit || deposit.userId !== userId) {
      throw new Error('Deposit not found or unauthorized')
    }

    sessionParams.line_items = [
      {
        price_data: {
          currency,
          product_data: {
            name: 'Project Deposit',
            description: description || `Deposit for ${deposit.project?.name || 'project'}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ]
    sessionParams.mode = 'payment'
    baseMetadata.depositId = depositId

  } else if (type === 'credit_purchase') {
    if (!amount || !creditAmount) {
      throw new Error('amount and creditAmount are required for credit purchase')
    }

    sessionParams.line_items = [
      {
        price_data: {
          currency,
          product_data: {
            name: 'Service Credits',
            description: description || `Purchase ${creditAmount} credits`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ]
    sessionParams.mode = 'payment'
    baseMetadata.creditAmount = creditAmount.toString()
  }

  // Update metadata in session params
  sessionParams.metadata = baseMetadata

  // Create the checkout session
  const session = await stripe.checkout.sessions.create(sessionParams)

  return session
}

/**
 * Retrieve a checkout session
 */
export async function getCheckoutSession(sessionId: string) {
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent'],
  })
}

/**
 * Verify checkout session belongs to user
 */
export async function verifyCheckoutSessionUser(
  sessionId: string,
  userId: string
) {
  const session = await getCheckoutSession(sessionId)

  if (session.metadata?.userId !== userId) {
    throw new Error('Unauthorized: session does not belong to user')
  }

  return session
}
