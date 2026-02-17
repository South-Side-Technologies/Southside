'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function OnboardingComplete() {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'complete' | 'pending' | 'error'>('checking')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/contractor/payments/status')
        if (!response.ok) throw new Error('Failed to check status')

        const data = await response.json()

        if (data.onboardingComplete) {
          setStatus('complete')
        } else if (data.onboardingStarted) {
          setStatus('pending')
        } else {
          setStatus('error')
          setError('Onboarding not found')
        }
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Failed to check status')
      }
    }

    checkStatus()
  }, [])

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-400">Verifying your onboarding status...</p>
        </div>
      </div>
    )
  }

  if (status === 'complete') {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Setup Complete!</h1>
          <p className="text-gray-400">Your bank account has been successfully connected</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-8 text-center">
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">You're all set!</h2>
              <p className="text-gray-400 mt-2">Your payment method is ready. You'll now receive payments when you complete projects.</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-green-900">
                You can now start working on projects and earn payments. Check your payment dashboard to track your earnings.
              </p>
            </div>

            <Link
              href="/contractor/payments"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Go to Payment Dashboard
            </Link>

            <p className="text-xs text-gray-400 mt-6">
              It may take 24 hours for your account to be fully activated for payouts.
            </p>
          </div>
        </div>
      </>
    )
  }

  if (status === 'pending') {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Setup In Progress</h1>
          <p className="text-gray-400">Your payment method is being verified</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-8 text-center">
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verification In Progress</h2>
              <p className="text-gray-400 mt-2">Stripe is reviewing your information. This usually takes a few hours.</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-yellow-900">
                We'll send you an email when your account is fully activated. You can still accept projects while we verify your information.
              </p>
            </div>

            <Link
              href="/contractor/payments"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Go to Payment Dashboard
            </Link>

            <p className="text-xs text-gray-400 mt-6">
              Check your email for updates on your account status.
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Something Went Wrong</h1>
        <p className="text-gray-400">We couldn't verify your onboarding status</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-8 text-center">
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </div>

          <Link
            href="/contractor/payments/onboarding"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors mr-3"
          >
            Try Again
          </Link>
          <Link
            href="/contractor/payments"
            className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Back
          </Link>
        </div>
      </div>
    </>
  )
}
