import { stripe } from './client'
import prisma from '@/app/lib/db/prisma'

/**
 * Get or create a Stripe customer for a user
 * Ensures idempotency - same user always gets same customer ID
 */
export async function getOrCreateStripeCustomer(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, email: true, name: true },
  })

  if (!user) {
    throw new Error(`User not found: ${userId}`)
  }

  // Return existing customer if already created
  if (user.stripeCustomerId) {
    return user.stripeCustomerId
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name || undefined,
    metadata: {
      userId: userId,
    },
  })

  // Save customer ID to database
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}

/**
 * Save a payment method as the default for a user
 */
export async function setDefaultPaymentMethod(
  userId: string,
  paymentMethodId: string
) {
  const customerId = await getOrCreateStripeCustomer(userId)

  // Attach payment method to customer if not already attached
  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)

  if (paymentMethod.customer !== customerId) {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })
  }

  // Set as default
  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  })

  // Get card info for storage
  const cardLast4 = paymentMethod.card?.last4
  const cardBrand = paymentMethod.card?.brand

  // Save to database
  await prisma.user.update({
    where: { id: userId },
    data: {
      defaultPaymentMethodId: paymentMethodId,
      paymentMethodLast4: cardLast4 || undefined,
      paymentMethodType: cardBrand || undefined,
    },
  })
}

/**
 * Get customer's payment methods
 */
export async function getCustomerPaymentMethods(customerId: string) {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  })

  return paymentMethods.data.map((pm) => ({
    id: pm.id,
    brand: pm.card?.brand,
    last4: pm.card?.last4,
    expMonth: pm.card?.exp_month,
    expYear: pm.card?.exp_year,
  }))
}

/**
 * Retrieve customer from Stripe
 */
export async function getStripeCustomer(customerId: string) {
  return await stripe.customers.retrieve(customerId)
}

/**
 * Delete a payment method (detach from customer)
 */
export async function deletePaymentMethod(paymentMethodId: string) {
  return await stripe.paymentMethods.detach(paymentMethodId)
}
