'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/app/lib/utils'

interface InvoicePaymentButtonProps {
  invoiceId: string
  amount: number
  status: string
  invoiceNumber: string
  creditBalance?: number
}

export default function InvoicePaymentButton({
  invoiceId,
  amount,
  status,
  invoiceNumber,
  creditBalance = 0,
}: InvoicePaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreditOption, setShowCreditOption] = useState(false)

  const canPayWithCredits = creditBalance >= amount && status !== 'PAID'
  const isPaid = status === 'PAID'

  const handlePayWithCard = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/dashboard/billing/invoices/${invoiceId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useCredits: false }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout session')
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

  const handlePayWithCredits = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/dashboard/billing/invoices/${invoiceId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useCredits: true }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to pay with credits')
      }

      // Refresh page on success
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setLoading(false)
    }
  }

  if (isPaid) {
    return (
      <div className="flex items-center gap-2 text-green-700">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-medium">Paid</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {canPayWithCredits && !showCreditOption && (
          <>
            <button
              onClick={handlePayWithCard}
              disabled={loading}
              className="w-full px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              {loading ? 'Processing...' : `Pay ${formatCurrency(amount)} with Card`}
            </button>

            <button
              onClick={() => setShowCreditOption(true)}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              Pay with {formatCurrency(creditBalance)} Credits
            </button>
          </>
        )}

        {showCreditOption && canPayWithCredits && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <p className="text-sm text-blue-900">
                Pay {formatCurrency(amount)} using your service credits?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handlePayWithCredits}
                  disabled={loading}
                  className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
                >
                  {loading ? 'Paying...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setShowCreditOption(false)}
                  disabled={loading}
                  className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-300 rounded text-sm hover:bg-gray-300 disabled:opacity-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}

        {!canPayWithCredits && (
          <button
            onClick={handlePayWithCard}
            disabled={loading}
            className="w-full px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            {loading ? 'Processing...' : `Pay ${formatCurrency(amount)} with Card`}
          </button>
        )}
      </div>

      {status === 'OVERDUE' && (
        <p className="text-xs text-red-600 text-center">
          This invoice is overdue. Please pay as soon as possible.
        </p>
      )}
    </div>
  )
}
