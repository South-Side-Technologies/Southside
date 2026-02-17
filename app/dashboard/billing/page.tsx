'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/app/lib/utils'
import SubscriptionManager from '@/app/components/dashboard/SubscriptionManager'
import CreditBalanceCard from '@/app/components/dashboard/CreditBalanceCard'

interface Subscription {
  id: string
  plan: string
  amount: number
  billing: string
  status: string
  nextBillingDate?: string
  currentPeriodEnd?: string
  stripeSubscriptionId?: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  date: string
  status: string
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch subscription
        const subRes = await fetch('/api/dashboard/billing/subscription')
        if (subRes.ok) {
          const subData = await subRes.json()
          setSubscription(subData)
        }

        // Fetch recent invoices
        const invRes = await fetch('/api/dashboard/billing/invoices')
        if (invRes.ok) {
          const invData = await invRes.json()
          setRecentInvoices(invData.slice(0, 5))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load billing data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Billing & Payments</h1>
        <p className="text-secondary">
          Manage your subscription, invoices, and service credits
        </p>
      </div>

      {error && (
        <div className="alert-error">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Subscription & Credits */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscription Manager */}
          {!loading && (
            <SubscriptionManager subscription={subscription} />
          )}

          {/* Credit Balance */}
          <CreditBalanceCard />

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/dashboard/billing/invoices"
                className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium text-center"
              >
                View All Invoices
              </Link>
              <Link
                href="/dashboard/billing/credits"
                className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium text-center"
              >
                Credit History
              </Link>
              <Link
                href="/dashboard/billing/invoices"
                className="px-4 py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium text-center"
              >
                View Deposits
              </Link>
              <Link
                href="/dashboard/billing/payments"
                className="px-4 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium text-center"
              >
                Payment History
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column - Summary Cards */}
        <div className="space-y-6">
          {/* Account Status */}
          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              Account Status
            </h3>
            <div className="space-y-3">
              {subscription ? (
                <>
                  <div>
                    <p className="text-xs text-gray-400">Subscription</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {subscription.plan}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      subscription.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {subscription.status}
                    </span>
                  </div>
                  {subscription.nextBillingDate && (
                    <div>
                      <p className="text-xs text-gray-400">Next Billing</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(subscription.nextBillingDate)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400">No active subscription</p>
                  <Link href="/dashboard/billing/plans" className="text-blue-600 hover:text-blue-700 text-xs font-medium mt-2 block">
                    Browse Plans →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Outstanding Balance */}
          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              Outstanding Balance
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(
                recentInvoices
                  .filter((inv) => inv.status !== 'PAID')
                  .reduce((sum, inv) => sum + inv.amount, 0)
              )}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {recentInvoices.filter((inv) => inv.status !== 'PAID').length} unpaid invoice
              {recentInvoices.filter((inv) => inv.status !== 'PAID').length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Help */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700 font-medium mb-2">Need help?</p>
            <p className="text-xs text-blue-600 mb-3">
              Contact our support team for billing questions
            </p>
            <a href="mailto:support@example.com" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              support@example.com →
            </a>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      {recentInvoices.length > 0 && (
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
            <Link href="/dashboard/billing/invoices" className="text-sm text-red-600 hover:text-red-700 font-medium">
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/dashboard/billing/invoices/${invoice.id}`}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
