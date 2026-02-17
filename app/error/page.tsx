'use client'

import React from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function ErrorPage() {
  return (
    <>
      <Header variant="public" subtitle="Error" />

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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Heading */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-playfair">
                Something Went Wrong
              </h1>

              {/* Message */}
              <p className="text-gray-400 text-lg mb-8">
                We encountered an unexpected error. Our team has been notified and is working to fix
                it. Please try again later.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-block bg-red-700 hover:bg-red-800 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  Back to Home
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-block bg-gray-800 hover:bg-gray-700 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  If the problem persists,{' '}
                  <Link href="/#chatbot" className="text-red-700 font-semibold hover:text-red-800">
                    contact support
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
