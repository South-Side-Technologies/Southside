'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/app/lib/utils'

interface Subscription {
  id: string
  plan: string
  planType: string
  amount: number
  billing: string
  status: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd: boolean
  canceledAt?: string
  nextBillingDate?: string
  stripeSubscriptionId?: string
}

interface SubscriptionManagerProps {
  subscription: Subscription | null
  availablePlans?: Array<{
    id: string
    name: string
    priceId: string
    amount: number
    billing: string
    features?: string[]
  }>
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getStatusColor(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800'
    case 'PAST_DUE':
      return 'bg-yellow-100 text-yellow-800'
    case 'CANCELED':
      return 'bg-red-100 text-red-800'
    case 'TRIALING':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function SubscriptionManager({
  subscription,
  availablePlans = [],
}: SubscriptionManagerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showResumeConfirm, setShowResumeConfirm] = useState(false)

  const handleCancel = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/dashboard/billing/subscription', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      setShowCancelConfirm(false)
      // Refresh the page to show updated subscription
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription')
      setLoading(false)
    }
  }

  const handleResume = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/dashboard/billing/subscription', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resume' }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to resume subscription')
      }

      setShowResumeConfirm(false)
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume subscription')
      setLoading(false)
    }
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Active Subscription
          </h3>
          <p className="text-gray-600 mb-6">
            Choose a plan to get started with our service
          </p>

          {availablePlans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePlans.map((plan) => (
                <Link
                  key={plan.id}
                  href={`/dashboard/billing/subscribe?plan=${plan.id}`}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-red-700 transition-colors text-left"
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {plan.name}
                  </h4>
                  <p className="text-2xl font-bold text-red-700 mb-2">
                    {formatCurrency(plan.amount)}
                    <span className="text-sm text-gray-600 font-normal">
                      /{plan.billing === 'ANNUAL' ? 'year' : 'month'}
                    </span>
                  </p>
                  {plan.features && plan.features.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  <button className="w-full px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors font-medium text-sm">
                    Choose Plan →
                  </button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Current Subscription</h2>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Subscription Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plan
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {subscription.plan}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatCurrency(subscription.amount)}
              <span className="text-sm text-gray-600 font-normal">
                /{subscription.billing === 'ANNUAL' ? 'year' : 'month'}
              </span>
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </p>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  subscription.status
                )}`}
              >
                {subscription.status}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Billing Period
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {subscription.currentPeriodStart && subscription.currentPeriodEnd && (
                <>
                  {formatDate(subscription.currentPeriodStart)} -{' '}
                  {formatDate(subscription.currentPeriodEnd)}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {subscription.status === 'PAST_DUE' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-700">
              Your subscription is past due. Please update your payment method to continue your service.
            </p>
          </div>
        )}

        {subscription.cancelAtPeriodEnd && subscription.canceledAt && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <p className="text-sm text-red-700">
              Your subscription will be canceled on{' '}
              <strong>{formatDate(subscription.currentPeriodEnd || '')}</strong>.
            </p>
            <button
              onClick={() => setShowResumeConfirm(true)}
              disabled={loading}
              className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              Undo cancellation →
            </button>
          </div>
        )}

        {subscription.status === 'ACTIVE' && !subscription.cancelAtPeriodEnd && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700">
              Your subscription is active and will renew on{' '}
              <strong>{formatDate(subscription.nextBillingDate || '')}</strong>.
            </p>
          </div>
        )}

        {/* Actions */}
        {!showCancelConfirm && !showResumeConfirm && (
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {availablePlans.length > 0 && (
              <Link
                href="/dashboard/billing/plans"
                className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm text-center"
              >
                Change Plan
              </Link>
            )}

            {subscription.status === 'ACTIVE' && !subscription.cancelAtPeriodEnd && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors font-medium text-sm"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        )}

        {/* Confirmation Dialogs */}
        {showCancelConfirm && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <p className="text-sm text-red-700">
              Are you sure you want to cancel your subscription? Your access will continue until the end of your current billing period.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
              >
                {loading ? 'Canceling...' : 'Confirm Cancellation'}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors font-medium text-sm"
              >
                Keep Subscription
              </button>
            </div>
          </div>
        )}

        {showResumeConfirm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <p className="text-sm text-blue-700">
              Resume your subscription? You'll be charged according to your plan on your next billing date.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleResume}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
              >
                {loading ? 'Resuming...' : 'Resume Subscription'}
              </button>
              <button
                onClick={() => setShowResumeConfirm(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
