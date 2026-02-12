import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/app/lib/stripe/client'
import prisma from '@/app/lib/db/prisma'
import { calculatePaymentFees } from '@/app/lib/stripe/fees'
import Stripe from 'stripe'

export const config = {
  api: {
    bodyParser: false,
  },
}

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhooks for payment status updates
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    // Check for duplicate webhooks
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { stripeEventId: event.id },
    })

    if (existingEvent && existingEvent.processedAt) {
      // Already processed, return success
      return NextResponse.json({ received: true })
    }

    // Mark as processing
    if (!existingEvent) {
      await prisma.webhookEvent.create({
        data: {
          stripeEventId: event.id,
          type: event.type,
        },
      })
    }

    switch (event.type) {
      // Contractor payout events
      case 'transfer.created':
        console.log('Transfer created:', (event.data.object as any).id)
        break

      case 'transfer.paid': {
        const transferId = (event.data.object as any).id
        const transfer = await getTransferObject(transferId, event.data.object as Stripe.Transfer)
        await handleTransferPaid(transfer)
        break
      }

      case 'transfer.failed': {
        const transferId = (event.data.object as any).id
        const transfer = await getTransferObject(transferId, event.data.object as Stripe.Transfer)
        await handleTransferFailed(transfer)
        break
      }

      case 'account.updated': {
        const accountId = (event.data.object as any).id
        const account = await getAccountObject(accountId, event.data.object as Stripe.Account)
        await handleAccountUpdated(account)
        break
      }

      // Client payment events
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentSucceeded(paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentFailed(paymentIntent)
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(subscription)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }
    }

    // Mark as processed
    await prisma.webhookEvent.update({
      where: { stripeEventId: event.id },
      data: {
        processedAt: new Date(),
      },
    })

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)

    // Mark event as failed
    await prisma.webhookEvent.update({
      where: { stripeEventId: event.id },
      data: {
        failedAt: new Date(),
        error: error.message,
      },
    }).catch((err) => {
      console.error('Failed to mark webhook event as failed:', err)
    })

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to get full transfer object
 * Handles both full and thin webhook payloads
 */
async function getTransferObject(
  transferId: string,
  payloadObject: Stripe.Transfer
): Promise<Stripe.Transfer> {
  // If payload has failure_message or status, it's likely a full payload
  if (payloadObject.failure_message !== undefined || payloadObject.status) {
    return payloadObject
  }

  // Thin payload - fetch full object from Stripe
  console.log('Fetching full transfer object for thin payload:', transferId)
  return await stripe.transfers.retrieve(transferId)
}

/**
 * Helper function to get full account object
 * Handles both full and thin webhook payloads
 */
async function getAccountObject(
  accountId: string,
  payloadObject: Stripe.Account
): Promise<Stripe.Account> {
  // If payload has charges_enabled or payouts_enabled, it's likely a full payload
  if (
    payloadObject.charges_enabled !== undefined ||
    payloadObject.payouts_enabled !== undefined
  ) {
    return payloadObject
  }

  // Thin payload - fetch full object from Stripe
  console.log('Fetching full account object for thin payload:', accountId)
  return await stripe.accounts.retrieve(accountId)
}

async function handleTransferPaid(transfer: Stripe.Transfer) {
  const payout = await prisma.contractorPayout.findUnique({
    where: { stripeTransferId: transfer.id },
  })

  if (payout) {
    await prisma.contractorPayout.update({
      where: { id: payout.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })
  }
}

async function handleTransferFailed(transfer: Stripe.Transfer) {
  const payout = await prisma.contractorPayout.findUnique({
    where: { stripeTransferId: transfer.id },
  })

  if (payout) {
    await prisma.contractorPayout.update({
      where: { id: payout.id },
      data: {
        status: 'FAILED',
        failureReason: transfer.failure_message || 'Transfer failed',
      },
    })

    // Update assignments back to PENDING for retry
    await prisma.projectAssignment.updateMany({
      where: { payoutId: payout.id },
      data: { paymentStatus: 'PENDING' },
    })
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  const user = await prisma.user.findFirst({
    where: { stripeConnectAccountId: account.id },
  })

  if (user) {
    const isComplete = account.charges_enabled && account.payouts_enabled

    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeOnboardingComplete: isComplete,
      },
    })
  }
}

/**
 * Handle successful checkout session completion
 * Routes to appropriate handler based on payment type
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const type = session.metadata?.type
  const userId = session.metadata?.userId

  if (!userId) {
    console.warn('Checkout session missing userId metadata')
    return
  }

  switch (type) {
    case 'invoice':
      await handleCheckoutInvoicePayment(session, userId)
      break
    case 'subscription':
      // Subscription is handled by customer.subscription.created event
      break
    case 'deposit':
      await handleCheckoutDepositPayment(session, userId)
      break
    case 'credit_purchase':
      await handleCheckoutCreditPurchase(session, userId)
      break
    default:
      console.warn('Unknown checkout session type:', type)
  }
}

/**
 * Handle invoice payment via checkout
 */
async function handleCheckoutInvoicePayment(
  session: Stripe.Checkout.Session,
  userId: string
) {
  const invoiceId = session.metadata?.invoiceId

  if (!invoiceId) return

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { amount: true, invoiceNumber: true },
  })

  if (!invoice) return

  const now = new Date()

  // Update invoice as paid
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: 'PAID',
      paidAt: now,
      stripeCheckoutSessionId: session.id,
    },
  })

  // Calculate Stripe fees (2.9% + $0.30 for card payments)
  const feeDetails = calculatePaymentFees(invoice.amount, 'card')

  // Create payment record
  await prisma.payment.create({
    data: {
      type: 'INVOICE',
      userId,
      invoiceId,
      amount: invoice.amount,
      currency: session.currency || 'usd',
      stripeFeeAmount: feeDetails.stripeFeeAmount,
      connectFeeAmount: 0, // No connect fee for client payments
      platformFeeAmount: feeDetails.platformFeeAmount,
      netAmount: feeDetails.netAmount,
      status: 'COMPLETED',
      stripeCheckoutSessionId: session.id,
      completedAt: now,
      description: `Invoice ${invoice.invoiceNumber} paid`,
    },
  })

  // Log activity
  await prisma.activityLog.create({
    data: {
      type: 'payment_received',
      userId,
      newValue: 'PAID',
      metadata: {
        amount: invoice.amount,
        invoiceId,
        type: 'invoice',
      },
    },
  })
}

/**
 * Handle deposit payment via checkout
 */
async function handleCheckoutDepositPayment(
  session: Stripe.Checkout.Session,
  userId: string
) {
  const depositId = session.metadata?.depositId

  if (!depositId) return

  const deposit = await prisma.deposit.findUnique({
    where: { id: depositId },
    select: { id: true, amount: true, purpose: true, projectId: true },
  })

  if (!deposit) return

  const now = new Date()

  // Update deposit as paid
  await prisma.deposit.update({
    where: { id: depositId },
    data: {
      status: 'PAID',
      paidAt: now,
      stripePaymentIntentId: session.payment_intent as string,
    },
  })

  // Update project deposit tracking if applicable
  if (deposit.projectId) {
    await prisma.project.update({
      where: { id: deposit.projectId },
      data: { depositPaid: true },
    })
  }

  // Calculate Stripe fees (2.9% + $0.30 for card payments)
  const feeDetails = calculatePaymentFees(deposit.amount, 'card')

  // Create payment record
  await prisma.payment.create({
    data: {
      type: 'DEPOSIT',
      userId,
      depositId,
      amount: deposit.amount,
      currency: session.currency || 'usd',
      stripeFeeAmount: feeDetails.stripeFeeAmount,
      connectFeeAmount: 0,
      platformFeeAmount: feeDetails.platformFeeAmount,
      netAmount: feeDetails.netAmount,
      status: 'COMPLETED',
      stripeCheckoutSessionId: session.id,
      completedAt: now,
      description: `Project deposit paid - ${deposit.purpose || 'Deposit'}`,
    },
  })

  // Log activity
  await prisma.activityLog.create({
    data: {
      type: 'payment_received',
      userId,
      newValue: 'PAID',
      metadata: {
        amount: deposit.amount,
        depositId,
        type: 'deposit',
        projectId: deposit.projectId,
      },
    },
  })
}

/**
 * Handle credit purchase via checkout
 */
async function handleCheckoutCreditPurchase(
  session: Stripe.Checkout.Session,
  userId: string
) {
  const creditAmountStr = session.metadata?.creditAmount

  if (!creditAmountStr) return

  const creditAmount = parseFloat(creditAmountStr)
  const amount = (session.amount_total || 0) / 100

  const now = new Date()

  // Get or create credit balance
  let creditBalance = await prisma.creditBalance.findUnique({
    where: { userId },
  })

  if (!creditBalance) {
    creditBalance = await prisma.creditBalance.create({
      data: { userId },
    })
  }

  const balanceAfter = creditBalance.currentBalance + creditAmount

  // Update credit balance
  await prisma.creditBalance.update({
    where: { userId },
    data: {
      currentBalance: {
        increment: creditAmount,
      },
      lifetimeCredits: {
        increment: creditAmount,
      },
    },
  })

  // Create credit transaction
  await prisma.creditTransaction.create({
    data: {
      creditBalanceId: creditBalance.id,
      type: 'PURCHASE',
      amount: creditAmount,
      description: `Credit purchase - ${creditAmount} credits`,
      balanceAfter,
    },
  })

  // Calculate Stripe fees (2.9% + $0.30 for card payments)
  const feeDetails = calculatePaymentFees(amount, 'card')

  // Create payment record
  await prisma.payment.create({
    data: {
      type: 'CREDIT_PURCHASE',
      userId,
      amount,
      currency: session.currency || 'usd',
      stripeFeeAmount: feeDetails.stripeFeeAmount,
      connectFeeAmount: 0,
      platformFeeAmount: feeDetails.platformFeeAmount,
      netAmount: feeDetails.netAmount,
      status: 'COMPLETED',
      stripeCheckoutSessionId: session.id,
      completedAt: now,
      metadata: {
        creditAmount,
      },
      description: `Purchased ${creditAmount} service credits`,
    },
  })

  // Log activity
  await prisma.activityLog.create({
    data: {
      type: 'payment_received',
      userId,
      newValue: 'COMPLETED',
      metadata: {
        amount,
        creditAmount,
        type: 'credit_purchase',
      },
    },
  })
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  // Mark webhook event as handled if metadata indicates it's tied to a checkout
  // Checkout session completion is primary event, payment intent is secondary
  console.log('Payment intent succeeded:', paymentIntent.id)
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const invoiceId = paymentIntent.metadata?.invoiceId

  if (invoiceId) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    })

    if (invoice) {
      // Update invoice to overdue
      await prisma.invoice.update({
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
          currency: paymentIntent.currency,
          status: 'FAILED',
          stripePaymentIntentId: paymentIntent.id,
          failureReason:
            paymentIntent.last_payment_error?.message || 'Payment failed',
          description: `Invoice payment failed - ${paymentIntent.id}`,
        },
      })

      // Log activity
      await prisma.activityLog.create({
        data: {
          type: 'payment_failed',
          userId: invoice.userId,
          newValue: 'FAILED',
          metadata: {
            amount: invoice.amount,
            invoiceId,
            reason: paymentIntent.last_payment_error?.message,
          },
        },
      })
    }
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.warn('Subscription missing userId metadata')
    return
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) return

  // Get subscription details
  const priceId = subscription.items.data[0]?.price.id
  const productId = subscription.items.data[0]?.price.product

  if (typeof productId !== 'string') return

  const product = await stripe.products.retrieve(productId)
  const price = await stripe.prices.retrieve(priceId!)

  const nextBillingDate = new Date(subscription.current_period_end * 1000)

  // Update or create subscription record
  const sub = await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: product.name,
      amount: (price.unit_amount || 0) / 100,
      nextBillingDate,
      paymentMethod: JSON.stringify({}),
      billing: price.recurring?.interval === 'year' ? 'ANNUAL' : 'MONTHLY',
      stripeSubscriptionId: subscription.id,
      stripeProductId: product.id,
      stripePriceId: priceId,
      status: 'ACTIVE',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: nextBillingDate,
    },
    update: {
      plan: product.name,
      amount: (price.unit_amount || 0) / 100,
      nextBillingDate,
      stripeSubscriptionId: subscription.id,
      stripeProductId: product.id,
      stripePriceId: priceId,
      status: 'ACTIVE',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: nextBillingDate,
    },
  })

  // Create payment record for initial charge if already paid
  if (subscription.status === 'active') {
    await prisma.payment.create({
      data: {
        type: 'SUBSCRIPTION',
        userId,
        subscriptionId: sub.id,
        amount: (price.unit_amount || 0) / 100,
        currency: subscription.currency,
        status: 'COMPLETED',
        completedAt: new Date(),
        description: `Subscription to ${product.name}`,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'subscription_created',
        userId,
        newValue: 'ACTIVE',
        metadata: {
          plan: product.name,
          amount: (price.unit_amount || 0) / 100,
        },
      },
    })
  }
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!sub) return

  const statusMap: Record<Stripe.Subscription.Status, any> = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    incomplete: 'INCOMPLETE',
    incomplete_expired: 'INCOMPLETE_EXPIRED',
    trialing: 'TRIALING',
    unpaid: 'UNPAID',
  }

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: statusMap[subscription.status],
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
    },
  })

  // Log activity
  await prisma.activityLog.create({
    data: {
      type: 'subscription_updated',
      userId: sub.userId,
      newValue: statusMap[subscription.status],
      metadata: {
        subscriptionId: subscription.id,
      },
    },
  })
}

/**
 * Handle subscription deleted/canceled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!sub) return

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
      cancelAtPeriodEnd: false,
    },
  })

  // Log activity
  await prisma.activityLog.create({
    data: {
      type: 'subscription_canceled',
      userId: sub.userId,
      newValue: 'CANCELED',
      metadata: {
        subscriptionId: subscription.id,
      },
    },
  })
}

/**
 * Handle invoice payment succeeded (for subscription recurring billing)
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: invoice.subscription as string },
  })

  if (!subscription) return

  // Create payment record for recurring billing
  await prisma.payment.create({
    data: {
      type: 'SUBSCRIPTION',
      userId: subscription.userId,
      subscriptionId: subscription.id,
      amount: (invoice.total || 0) / 100,
      currency: invoice.currency,
      status: 'COMPLETED',
      completedAt: new Date(),
      description: `Subscription billing - ${subscription.plan}`,
    },
  })

  // Update subscription nextBillingDate
  if (invoice.lines.data[0]?.period?.end) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        nextBillingDate: new Date(invoice.lines.data[0].period.end * 1000),
      },
    })
  }

  // Log activity
  await prisma.activityLog.create({
    data: {
      type: 'payment_received',
      userId: subscription.userId,
      newValue: 'PAID',
      metadata: {
        amount: (invoice.total || 0) / 100,
        type: 'subscription',
        invoiceId: invoice.id,
      },
    },
  })
}

/**
 * Handle invoice payment failed (for subscription recurring billing)
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: invoice.subscription as string },
  })

  if (!subscription) return

  // Create failed payment record
  await prisma.payment.create({
    data: {
      type: 'SUBSCRIPTION',
      userId: subscription.userId,
      subscriptionId: subscription.id,
      amount: (invoice.total || 0) / 100,
      currency: invoice.currency,
      status: 'FAILED',
      failureReason: 'Recurring billing payment failed',
      description: `Subscription billing failed - ${subscription.plan}`,
    },
  })

  // Update subscription status
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'PAST_DUE',
    },
  })

  // Log activity
  await prisma.activityLog.create({
    data: {
      type: 'payment_failed',
      userId: subscription.userId,
      newValue: 'FAILED',
      metadata: {
        amount: (invoice.total || 0) / 100,
        type: 'subscription',
        invoiceId: invoice.id,
      },
    },
  })
}
