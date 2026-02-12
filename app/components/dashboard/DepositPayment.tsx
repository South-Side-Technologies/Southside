'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/app/lib/utils'

interface DepositPaymentProps {
  deposit: {
    id: string
    amount: number
    status: string
    purpose?: string
    projectId?: string
    project?: {
      id: string
      name: string
    }
    paidAt?: string | null
  }
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
    case 'PAID':
      return 'bg-green-100 text-green-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'EXPIRED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function DepositPayment({ deposit }: DepositPaymentProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayDeposit = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/dashboard/billing/deposits/${deposit.id}/checkout`,
        { method: 'POST' }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">
              {deposit.project ? `${deposit.project.name} Deposit` : 'Project Deposit'}
            </h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                deposit.status
              )}`}
            >
              {deposit.status}
            </span>
          </div>

          {deposit.purpose && (
            <p className="text-sm text-gray-600 mb-2">{deposit.purpose}</p>
          )}

          {deposit.project && (
            <Link
              href={`/dashboard/projects/${deposit.project.id}`}
              className="text-xs text-red-600 hover:text-red-700 underline"
            >
              View Project →
            </Link>
          )}
        </div>

        <div className="text-right ml-4">
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(deposit.amount)}
          </p>
          {deposit.paidAt && (
            <p className="text-xs text-gray-500 mt-1">
              Paid {formatDate(deposit.paidAt)}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {deposit.status === 'PAID' ? (
        <div className="flex items-center gap-2 text-green-700 text-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Deposit received
        </div>
      ) : (
        <button
          onClick={handlePayDeposit}
          disabled={loading}
          className="w-full px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          {loading ? 'Processing...' : `Pay Deposit ${formatCurrency(deposit.amount)}`}
        </button>
      )}
    </div>
  )
}
