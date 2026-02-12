'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingUser, setIsFetchingUser] = useState(true)
  const [error, setError] = useState('')

  // Fetch user's email from Cloudflare JWT on mount
  React.useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/user')
        if (response.ok) {
          const data = await response.json()
          setFormData((prev) => ({
            ...prev,
            email: data.user.email,
            name: data.user.name || '',
          }))
        }
      } catch (err) {
        console.error('Error fetching user info:', err)
      } finally {
        setIsFetchingUser(false)
      }
    }

    fetchUserInfo()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Registration failed')
      }

      // Registration successful - redirect directly to dashboard
      // (bypassing customer-login to avoid email mismatch in dev mode)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register. Please try again.')
      console.error('Registration error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header variant="public" subtitle="Create Your Account" />

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h1 className="text-3xl font-bold text-black mb-2 font-playfair text-center">
              Create Account
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Join South Side Tech to access your customer dashboard
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Display logged-in email (not editable) */}
              {formData.email && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    Registering as:{' '}
                    <span className="font-semibold text-gray-900">{formData.email}</span>
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  placeholder="Your Company Inc."
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || isFetchingUser}
                className="w-full bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isFetchingUser ? 'Loading...' : isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-gray-600 text-sm mt-6">
              Already have an account?{' '}
              <Link href="/customer-login" className="text-red-700 hover:text-red-800 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer variant="minimal" />
    </>
  )
}
