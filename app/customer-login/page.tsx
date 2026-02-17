'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function CustomerLoginPage() {
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    // Check if user is logged in
    if (session?.user) {
      // User is logged in - redirect to dashboard
      router.push('/dashboard')
    } else if (session === undefined) {
      // Session is still loading, don't redirect yet
      return
    } else {
      // User is not logged in - redirect to login
      router.push('/login')
    }
  }, [session, router])

  return (
    <>
      <Header variant="public" subtitle="Customer Portal" />

      <main className="flex-grow bg-gradient-to-br from-red-50 via-white to-red-100">
        <section className="py-12 md:py-16 px-4 md:px-6">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-800 rounded-2xl shadow-lg border border-red-100 p-6 md:p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 font-playfair">Redirecting...</h2>
                <p className="text-gray-400 text-sm md:text-base mb-6">
                  Taking you to your dashboard
                </p>
              </div>

              <div className="mt-6 text-center text-sm text-gray-400">
                Need an account?{' '}
                <Link href="/register" className="text-red-700 font-semibold hover:text-red-800 transition-colors">
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="minimal" />
    </>
  )
}
