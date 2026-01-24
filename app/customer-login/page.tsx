'use client'

import React, { useState } from 'react'
import Link from 'next/link'

const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="36" height="36" rx="8" fill="#8B2E2E" />
    <path d="M12 20C12 15.58 15.58 12 20 12C24.42 12 28 15.58 28 20C28 24.42 24.42 28 20 28C15.58 28 12 24.42 12 20Z" fill="white" />
    <circle cx="20" cy="20" r="4" fill="#8B2E2E" />
  </svg>
)

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError('Customer login is not enabled yet. Please contact support.')
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit mx-auto sm:mx-0">
              <Logo />
              <h1 className="text-2xl md:text-3xl font-bold text-black font-alfa">South Side Tech</h1>
            </Link>
            <p className="text-gray-600 text-sm md:text-base text-center sm:text-right">Customer Portal</p>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-gradient-to-br from-red-50 via-white to-red-100">
        <section className="py-12 md:py-16 px-4 md:px-6">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-2 font-playfair text-center">Customer Login</h2>
              <p className="text-gray-600 text-sm md:text-base text-center mb-6">
                Sign in to view project updates, billing, and support.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm md:text-base">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-transparent text-base"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-transparent text-base"
                    placeholder="Your password"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-3 rounded-lg transition-colors text-base"
                >
                  Sign In
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                Need access?{' '}
                <Link href="/questionnaire" className="text-red-700 font-semibold hover:text-red-800 transition-colors">
                  Start a consultation
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="border-t border-gray-800 pt-6 md:pt-8 text-center text-gray-400 text-sm md:text-base">
            <p>&copy; 2026 South Side Technologies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
