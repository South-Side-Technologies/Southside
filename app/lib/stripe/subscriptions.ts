import { stripe } from './client'
import { getOrCreateStripeCustomer } from './customers'
import prisma from '@/app/lib/db/prisma'

/**
 * Create a subscription for a user
 */
export async function createSubscription(userId: string, priceId: string) {
  const customerId = await getOrCreateStripeCustomer(userId)

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      userId,
    },
  })

  // Get price info for database
  const price = await stripe.prices.retrieve(priceId)
  const product = await stripe.products.retrieve(price.product as string)

  // Save subscription to database
  await prisma.subscription.update({
    where: { userId },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeProductId: product.id,
      stripePriceId: priceId,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      status: 'ACTIVE',
      plan: product.name,
      amount: (price.unit_amount || 0) / 100,
      nextBillingDate: new Date(subscription.current_period_end * 1000),
    },
  })

  return subscription
}

/**
 * Cancel a subscription at end of period
 */
export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })

  // Update database
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      cancelAtPeriodEnd: true,
    },
  })

  return subscription
}

/**
 * Resume a canceled subscription
 */
export async function resumeSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })

  // Update database
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      cancelAtPeriodEnd: false,
    },
  })

  return subscription
}

/**
 * Change subscription plan (update price)
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
) {
  // Get current subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  if (!subscription.items.data[0]) {
    throw new Error('No items in subscription')
  }

  // Update subscription with new price
  const updated = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  })

  // Get new price info
  const price = await stripe.prices.retrieve(newPriceId)
  const product = await stripe.products.retrieve(price.product as string)

  // Update database
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      stripePriceId: newPriceId,
      amount: (price.unit_amount || 0) / 100,
      plan: product.name,
    },
  })

  return updated
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId)
}

/**
 * Sync subscription status from Stripe to database
 */
export async function syncSubscriptionStatus(subscriptionId: string) {
  const subscription = await getSubscription(subscriptionId)

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
    where: { stripeSubscriptionId: subscriptionId },
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
}

/**
 * List all subscriptions for a customer
 */
export async function getCustomerSubscriptions(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 10,
  })

  return subscriptions.data
}
