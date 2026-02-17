'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/app/lib/utils'

interface CreditTransaction {
  id: string
  type: string
  amount: number
  description: string
  balanceAfter: number
  createdAt: string
}

interface CreditBalanceData {
  id: string
  currentBalance: number
  lifetimeCredits: number
  lifetimeUsed: number
  transactions?: CreditTransaction[]
}

export default function CreditBalanceCard() {
  const [creditBalance, setCreditBalance] = useState<CreditBalanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchaseAmount, setPurchaseAmount] = useState(50)
  const [purchaseLoading, setPurchaseLoading] = useState(false)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch('/api/dashboard/billing/credits')
        if (!response.ok) throw new Error('Failed to fetch credits')
        const data = await response.json()
        setCreditBalance(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load credits')
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [])

  const handlePurchaseCredits = async () => {
    setPurchaseLoading(true)

    try {
      const response = await fetch('/api/dashboard/billing/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creditAmount: purchaseAmount }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed')
      setPurchaseLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
      </div>
    )
  }

  if (!creditBalance) {
    return null
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900">Service Credits</h2>
        <p className="text-sm text-gray-400 mt-1">
          Use credits to pay invoices instead of using a card
        </p>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Credit Balance Display */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              Current Balance
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(creditBalance.currentBalance)}
            </p>
          </div>

          <div className="text-center border-l border-r border-gray-700">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              Lifetime Purchased
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(creditBalance.lifetimeCredits)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              Lifetime Used
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(creditBalance.lifetimeUsed)}
            </p>
          </div>
        </div>

        {/* Purchase Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Purchase More Credits
          </button>
        </div>

        {/* Recent Transactions */}
        {creditBalance.transactions && creditBalance.transactions.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Recent Transactions
            </h3>
            <div className="space-y-2">
              {creditBalance.transactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {tx.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        tx.type === 'DEDUCTION' ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {tx.type === 'DEDUCTION' ? '-' : '+'}
                      {formatCurrency(tx.amount)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Balance: {formatCurrency(tx.balanceAfter)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Purchase Service Credits
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Credit Amount
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                    min="1"
                    step="10"
                    className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-400">credits</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Price: {formatCurrency(purchaseAmount)}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <strong>{formatCurrency(purchaseAmount)}</strong> in service credits
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                disabled={purchaseLoading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-300 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchaseCredits}
                disabled={purchaseLoading || purchaseAmount <= 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                {purchaseLoading ? 'Processing...' : 'Continue to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
