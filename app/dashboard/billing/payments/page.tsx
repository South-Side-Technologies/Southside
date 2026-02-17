'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/app/lib/utils'

interface Payment {
  id: string
  type: string
  amount: number
  currency: string
  status: string
  description: string
  createdAt: string
  completedAt?: string
  invoice?: {
    invoiceNumber: string
  }
  deposit?: {
    id: string
    purpose?: string
  }
  subscription?: {
    plan: string
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getPaymentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    INVOICE: 'Invoice Payment',
    SUBSCRIPTION: 'Subscription',
    DEPOSIT: 'Project Deposit',
    CREDIT_PURCHASE: 'Credit Purchase',
    REFUND: 'Refund',
  }
  return labels[type] || type
}

function getStatusColor(status: string) {
  switch (status) {
    case 'COMPLETED':
    case 'PAID':
      return 'bg-green-100 text-green-800'
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'FAILED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-800 text-gray-800'
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case 'INVOICE':
      return 'bg-blue-100 text-blue-700'
    case 'SUBSCRIPTION':
      return 'bg-purple-100 text-purple-700'
    case 'DEPOSIT':
      return 'bg-orange-100 text-orange-700'
    case 'CREDIT_PURCHASE':
      return 'bg-green-100 text-green-700'
    case 'REFUND':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-800 text-gray-300'
  }
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        // Fetch all payment-related data
        const [invoicesRes, creditsRes] = await Promise.all([
          fetch('/api/dashboard/billing/invoices'),
          fetch('/api/dashboard/billing/credits'),
        ])

        const paymentsList: Payment[] = []

        if (invoicesRes.ok) {
          const invoices = await invoicesRes.json()
          invoices.forEach((inv: any) => {
            if (inv.payments) {
              inv.payments.forEach((p: any) => {
                paymentsList.push({
                  id: p.id,
                  type: 'INVOICE',
                  amount: p.amount,
                  currency: 'usd',
                  status: p.status,
                  description: `Invoice ${inv.invoiceNumber}`,
                  createdAt: p.completedAt || inv.createdAt,
                  completedAt: p.completedAt,
                  invoice: { invoiceNumber: inv.invoiceNumber },
                })
              })
            }
          })
        }

        if (creditsRes.ok) {
          const credits = await creditsRes.json()
          if (credits.transactions) {
            credits.transactions.forEach((t: any) => {
              if (t.type === 'PURCHASE') {
                paymentsList.push({
                  id: t.id,
                  type: 'CREDIT_PURCHASE',
                  amount: t.amount,
                  currency: 'usd',
                  status: 'COMPLETED',
                  description: t.description,
                  createdAt: t.createdAt,
                  completedAt: t.createdAt,
                })
              }
            })
          }
        }

        // Sort by date descending
        paymentsList.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        setPayments(paymentsList)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load payments')
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  const filteredPayments =
    filter === 'all'
      ? payments
      : payments.filter((p) => p.type === filter)

  const completedPayments = filteredPayments.filter(
    (p) => p.status === 'COMPLETED' || p.status === 'PAID'
  )
  const totalSpent = completedPayments.reduce((sum, p) => sum + p.amount, 0)

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
        <div className="bg-gray-800 rounded-lg shadow p-6 text-center">
          <p className="text-gray-400">Loading payment history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment History</h1>
        <p className="text-gray-400">View all your payments and transactions</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
          <p className="text-sm text-gray-400 font-medium mb-2">Total Payments</p>
          <p className="text-3xl font-bold text-gray-900">{payments.length}</p>
          <p className="text-xs text-gray-400 mt-2">All time</p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
          <p className="text-sm text-gray-400 font-medium mb-2">Total Spent</p>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalSpent)}</p>
          <p className="text-xs text-gray-400 mt-2">Completed payments</p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
          <p className="text-sm text-gray-400 font-medium mb-2">Payment Methods</p>
          <p className="text-3xl font-bold text-gray-900">2</p>
          <p className="text-xs text-gray-400 mt-2">Card + Credits</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400 font-medium">Filter by type:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-red-700 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('INVOICE')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'INVOICE'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Invoices
          </button>
          <button
            onClick={() => setFilter('SUBSCRIPTION')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'SUBSCRIPTION'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setFilter('CREDIT_PURCHASE')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'CREDIT_PURCHASE'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Credits
          </button>
        </div>
      </div>

      {/* Payment Table */}
      {filteredPayments.length > 0 ? (
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
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
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{payment.description}</div>
                      {payment.invoice && (
                        <Link
                          href={`/dashboard/billing/invoices/${payment.id}`}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          View Invoice →
                        </Link>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                          payment.type
                        )}`}
                      >
                        {getPaymentTypeLabel(payment.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-12 text-center">
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
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
          <p className="text-gray-400 mb-6">
            Your payment history will appear here once you make your first payment
          </p>
          <Link
            href="/dashboard/billing/invoices"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium"
          >
            View Invoices →
          </Link>
        </div>
      )}
    </div>
  )
}
