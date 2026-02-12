import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/app/lib/db/prisma'
import {
  getSubscription,
  cancelSubscription,
  resumeSubscription,
  updateSubscriptionPlan,
} from '@/app/lib/stripe/subscriptions'

/**
 * GET /api/dashboard/billing/subscription
 * Fetch current subscription for authenticated user
 */
export async function GET(request: NextRequest) {
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

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
      include: {
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            completedAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!subscription) {
      return NextResponse.json({ subscription: null })
    }

    return NextResponse.json({
      id: subscription.id,
      plan: subscription.plan,
      planType: subscription.planType,
      amount: subscription.amount,
      billing: subscription.billing,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      canceledAt: subscription.canceledAt,
      nextBillingDate: subscription.nextBillingDate,
      payments: subscription.payments,
      createdAt: subscription.createdAt,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/dashboard/billing/subscription
 * Update subscription plan or cancel it
 * Body: { action: 'upgrade' | 'downgrade' | 'cancel' | 'resume', priceId?: string }
 */
export async function PATCH(request: NextRequest) {
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

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    })

    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { action, priceId } = body

    if (!action) {
      return NextResponse.json(
        { error: 'action is required' },
        { status: 400 }
      )
    }

    try {
      switch (action) {
        case 'upgrade':
        case 'downgrade':
          if (!priceId) {
            return NextResponse.json(
              { error: 'priceId is required for plan changes' },
              { status: 400 }
            )
          }
          await updateSubscriptionPlan(subscription.stripeSubscriptionId, priceId)
          break

        case 'cancel':
          await cancelSubscription(subscription.stripeSubscriptionId)
          break

        case 'resume':
          if (subscription.cancelAtPeriodEnd) {
            await resumeSubscription(subscription.stripeSubscriptionId)
          }
          break

        default:
          return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
          )
      }

      // Fetch updated subscription
      const updated = await prisma.subscription.findUnique({
        where: { userId: user.id },
      })

      // Log activity
      await prisma.activityLog.create({
        data: {
          type: 'subscription_updated',
          userId: user.id,
          newValue: action.toUpperCase(),
          metadata: {
            action,
            priceId: priceId || null,
          },
        },
      })

      return NextResponse.json({
        success: true,
        action,
        subscription: updated,
      })
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to update subscription' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/dashboard/billing/subscription
 * Cancel subscription at end of period
 */
export async function DELETE(request: NextRequest) {
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

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    })

    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 404 }
      )
    }

    try {
      await cancelSubscription(subscription.stripeSubscriptionId)

      // Log activity
      await prisma.activityLog.create({
        data: {
          type: 'subscription_canceled',
          userId: user.id,
          newValue: 'CANCELED',
          metadata: {
            subscriptionId: subscription.id,
          },
        },
      })

      return NextResponse.json({ success: true })
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to cancel subscription' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
