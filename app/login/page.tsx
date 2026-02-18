'use client'

import { signIn, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [mockAuthEnabled, setMockAuthEnabled] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const router = useRouter()
  const { data: session } = useSession()

  // Check if mock auth is enabled
  useEffect(() => {
    const checkMockAuth = async () => {
      try {
        // Try to reach mock auth endpoint (supports testMode query param for production testing)
        const response = await fetch('/api/auth/mock?testMode=true', { method: 'POST', body: JSON.stringify({}) })
        // If the endpoint responds with anything other than 403, mock auth is available
        setMockAuthEnabled(response.status !== 403)
      } catch (e) {
        setMockAuthEnabled(false)
      }
    }
    checkMockAuth()
  }, [])

  // Determine which area the user is trying to access
  const isContractorPage = callbackUrl?.includes('/contractor')
  const isAdminPage = callbackUrl?.includes('/admin')
  const isDashboardPage = !isContractorPage && !isAdminPage

  // If user is already logged in, redirect to the callback URL
  useEffect(() => {
    if (session?.user) {
      router.push(callbackUrl)
    }
  }, [session, callbackUrl, router])

  const handleGoogleSignIn = async () => {
    console.log('[Login] Google sign-in clicked')
    setLoading(true)
    try {
      console.log('[Login] Calling signIn with callback URL:', callbackUrl)
      const result = await signIn('google', {
        redirect: true,
        callbackUrl: callbackUrl,
      })
      console.log('[Login] signIn result:', result)
    } catch (error) {
      console.error('[Login] signIn error:', error)
      setLoading(false)
    }
  }

  const handleMockSignIn = async () => {
    console.log('[Login] Mock sign-in clicked')
    setLoading(true)
    try {
      // Call mock auth endpoint with testMode flag
      const response = await fetch('/api/auth/mock?testMode=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test User',
        }),
      })

      if (!response.ok) {
        throw new Error('Mock auth failed')
      }

      const data = await response.json()
      console.log('[Login] Mock auth response:', data)

      // Now sign in with credentials provider using the mock endpoint
      const result = await signIn('credentials', {
        redirect: true,
        callbackUrl: callbackUrl,
        email: 'test@example.com',
      })
      console.log('[Login] signIn result:', result)
    } catch (error) {
      console.error('[Login] Mock sign-in error:', error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-red-600 mb-2">South Side</h1>
            <p className="text-gray-300 text-lg">
              {isContractorPage && 'Contractor Portal'}
              {isAdminPage && 'Admin Dashboard'}
              {isDashboardPage && 'Client Portal'}
            </p>
          </div>

          {/* Subtitle - Changes based on where user is coming from */}
          <p className="text-center text-gray-400 mb-8">
            {isContractorPage && 'Sign in to access the contractor portal and manage your projects'}
            {isAdminPage && 'Sign in to access the admin dashboard and manage the platform'}
            {isDashboardPage && 'Sign in to manage your projects, documents, and support tickets'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
              <p className="text-red-200 text-sm">
                {error === 'OAuthSignin' && 'Failed to sign in. Please try again.'}
                {error === 'OAuthCallback' && 'An error occurred during sign in. Please try again.'}
                {error === 'EmailSignInError' && 'Failed to sign in with that email.'}
                {error === 'AccessDenied' && 'Access denied. Please check your account.'}
                {!['OAuthSignin', 'OAuthCallback', 'EmailSignInError', 'AccessDenied'].includes(error) && 'An error occurred. Please try again.'}
              </p>
            </div>
          )}

          {/* Mock Sign In Button (Test Mode) */}
          {mockAuthEnabled && (
            <button
              onClick={handleMockSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-yellow-700 border-2 border-yellow-600 text-yellow-100 rounded-lg py-3 px-4 hover:bg-yellow-600 hover:border-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              <span className="font-medium">
                {loading ? 'Signing in...' : '🧪 Test Sign In'}
              </span>
            </button>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-gray-700 border-2 border-gray-600 text-gray-200 rounded-lg py-3 px-4 hover:bg-gray-600 hover:border-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium">
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </span>
          </button>

          {/* Account Creation Info */}
          <div className="mb-6 p-4 bg-gray-900 border border-gray-700 rounded-lg">
            <p className="text-gray-300 text-sm text-center">
              💡 New user? Your account will be created automatically when you sign in with Google for the first time.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-center text-xs text-gray-400 mb-3">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-400">
              <Link href="#" className="hover:text-gray-300">
                Terms
              </Link>
              <span>•</span>
              <Link href="#" className="hover:text-gray-300">
                Privacy
              </Link>
              <span>•</span>
              <Link href="#" className="hover:text-gray-300">
                Support
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info - Changes based on context */}
        <div className="mt-8 text-center text-sm text-gray-400">
          {isContractorPage && <p>Accept projects • Track progress • Manage earnings</p>}
          {isAdminPage && <p>Manage contractors • Approve applications • Track payouts</p>}
          {isDashboardPage && <p>Manage projects • Collaborate with your team • Track support tickets</p>}
        </div>
      </div>
    </div>
  )
}
