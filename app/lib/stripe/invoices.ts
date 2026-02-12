import { stripe } from './client'
import { getOrCreateStripeCustomer } from './customers'
import prisma from '@/app/lib/db/prisma'

/**
 * Create a Stripe payment intent for an invoice
 * Used for processing invoice payments via card
 */
export async function createInvoicePaymentIntent(
  invoiceId: string,
  userId: string
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, amount: true, invoiceNumber: true, userId: true },
  })

  if (!invoice || invoice.userId !== userId) {
    throw new Error('Invoice not found or unauthorized')
  }

  const customerId = await getOrCreateStripeCustomer(userId)

  const paymentIntent = await stripe.paymentIntents.create({
    customer: customerId,
    amount: Math.round(invoice.amount * 100),
    currency: 'usd',
    description: `Invoice ${invoice.invoiceNumber}`,
    metadata: {
      invoiceId,
      userId,
      invoiceNumber: invoice.invoiceNumber,
    },
  })

  // Save payment intent ID to invoice
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { stripePaymentIntentId: paymentIntent.id },
  })

  return paymentIntent
}

/**
 * Apply credits to an invoice (pay with balance)
 */
export async function applyCreditsToInvoice(
  invoiceId: string,
  userId: string
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, amount: true, invoiceNumber: true, userId: true },
  })

  if (!invoice || invoice.userId !== userId) {
    throw new Error('Invoice not found or unauthorized')
  }

  // Get user's credit balance
  const creditBalance = await prisma.creditBalance.findUnique({
    where: { userId },
    select: { currentBalance: true },
  })

  if (!creditBalance || creditBalance.currentBalance < invoice.amount) {
    throw new Error('Insufficient credit balance')
  }

  // Deduct from balance
  await prisma.creditBalance.update({
    where: { userId },
    data: {
      currentBalance: {
        decrement: invoice.amount,
      },
      lifetimeUsed: {
        increment: invoice.amount,
      },
    },
  })

  // Create credit transaction
  await prisma.creditTransaction.create({
    data: {
      creditBalanceId: (creditBalance as any).id,
      type: 'DEDUCTION',
      amount: invoice.amount,
      description: `Invoice ${invoice.invoiceNumber} payment`,
      balanceAfter: creditBalance.currentBalance - invoice.amount,
    },
  })

  // Mark invoice as paid
  const now = new Date()
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: 'PAID',
      paidAt: now,
    },
  })

  // Create payment record
  await prisma.payment.create({
    data: {
      type: 'INVOICE',
      userId,
      invoiceId,
      amount: invoice.amount,
      currency: 'usd',
      status: 'COMPLETED',
      description: `Paid with credits - Invoice ${invoice.invoiceNumber}`,
      completedAt: now,
    },
  })

  // Log activity
  await prisma.activityLog.create({
    data: {
      type: 'payment',
      userId,
      newValue: 'PAID',
      oldValue: 'PENDING',
      metadata: {
        amount: invoice.amount,
        invoiceId,
        method: 'CREDITS',
      },
    },
  })

  return invoice
}

/**
 * Retrieve a payment intent
 */
export async function getPaymentIntent(paymentIntentId: string) {
  return await stripe.paymentIntents.retrieve(paymentIntentId)
}

/**
 * Mark invoice as paid (after successful payment)
 */
export async function markInvoiceAsPaid(
  invoiceId: string,
  stripePaymentIntentId?: string,
  stripeChargeId?: string
) {
  const now = new Date()

  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: 'PAID',
      paidAt: now,
      ...(stripePaymentIntentId && { stripePaymentIntentId }),
    },
  })

  // Create payment record
  await prisma.payment.create({
    data: {
      type: 'INVOICE',
      userId: invoice.userId,
      invoiceId,
      amount: invoice.amount,
      currency: 'usd',
      status: 'COMPLETED',
      ...(stripePaymentIntentId && { stripePaymentIntentId }),
      ...(stripeChargeId && { stripeChargeId }),
      completedAt: now,
      description: `Invoice ${invoice.invoiceNumber} paid`,
    },
  })

  // Log activity
  await prisma.activityLog.create({
    data: {
      type: 'payment',
      userId: invoice.userId,
      newValue: 'PAID',
      oldValue: 'PENDING',
      metadata: {
        amount: invoice.amount,
        invoiceId,
        method: 'CARD',
      },
    },
  })

  return invoice
}

/**
 * Mark invoice as failed payment
 */
export async function markInvoicePaymentFailed(
  invoiceId: string,
  reason: string
) {
  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: 'OVERDUE',
    },
  })

  // Create failed payment record
  await prisma.payment.create({
    data: {
      type: 'INVOICE',
      userId: invoice.userId,
      invoiceId,
      amount: invoice.amount,
      currency: 'usd',
      status: 'FAILED',
      failureReason: reason,
      description: `Invoice ${invoice.invoiceNumber} payment failed`,
    },
  })

  return invoice
}

/**
 * Retrieve invoice details including payment status
 */
export async function getInvoiceWithPaymentStatus(invoiceId: string) {
  return await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      payments: true,
    },
  })
}
