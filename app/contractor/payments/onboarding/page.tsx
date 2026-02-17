'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ContractorPaymentOnboarding() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartOnboarding = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/contractor/payments/onboard', {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to start onboarding')
      }

      const data = await response.json()

      // Redirect to Stripe onboarding
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Set Up Payment Method</h1>
        <p className="text-gray-600 dark:text-gray-400">Connect your bank account to receive contractor payments</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How it works</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Set up your Stripe account</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    You'll be redirected to Stripe to securely connect your bank account. This takes just a few minutes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Verify your information</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Provide your basic information and bank details. All data is encrypted and secure.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Get paid</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Once approved, you'll receive payments directly to your bank account when projects are completed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-900 dark:text-blue-400">
              <strong>Security note:</strong> We use Stripe to securely handle your banking information. We never store your bank account details directly.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleStartOnboarding}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Connecting...' : 'Connect Bank Account'}
            </button>
            <Link
              href="/contractor/payments"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back
            </Link>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            You'll be redirected to Stripe's secure platform. You can return to your dashboard at any time.
          </p>
        </div>

        <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">What you'll need</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span> Valid government-issued ID
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span> Business information (if applicable)
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span> Bank account details
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
