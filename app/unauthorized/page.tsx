import React from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function UnauthorizedPage() {
  return (
    <>
      <Header variant="public" subtitle="Access Denied" />

      <main className="flex-grow bg-gradient-to-br from-red-50 via-white to-red-100">
        <section className="py-16 md:py-24 px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gray-800 rounded-2xl shadow-lg border border-red-100 p-8 md:p-12">
              {/* Icon */}
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-red-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              {/* Heading */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-playfair">
                Access Denied
              </h1>

              {/* Message */}
              <p className="text-gray-400 text-lg mb-8">
                You don't have permission to access this page. Please sign in with an authorized
                account or contact support if you believe this is an error.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-block bg-red-700 hover:bg-red-800 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  Back to Home
                </Link>
                <Link
                  href="/questionnaire"
                  className="inline-block bg-gray-800 hover:bg-gray-700 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  Request Access
                </Link>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  Need help?{' '}
                  <Link href="/#chatbot" className="text-red-700 font-semibold hover:text-red-800">
                    Chat with support
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="minimal" />
    </>
  )
}
