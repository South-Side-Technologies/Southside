'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function OnboardingRefresh() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const refresh = async () => {
      try {
        const response = await fetch('/api/contractor/payments/onboard', {
          method: 'POST',
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to refresh')
        }

        const data = await response.json()

        // Redirect to new Stripe onboarding link
        if (data.onboardingUrl) {
          window.location.href = data.onboardingUrl
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to refresh onboarding')
        setLoading(false)
      }
    }

    refresh()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-400">Refreshing your onboarding link...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Refresh Onboarding</h1>
        <p className="text-gray-400">There was an issue with your onboarding link</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-8 text-center">
          {error && (
            <>
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Unable to Refresh</h2>
                <p className="text-red-600 mt-2">{error}</p>
              </div>

              <Link
                href="/contractor/payments/onboarding"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Start Onboarding
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
