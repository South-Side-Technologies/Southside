'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { isContractor } from '@/app/lib/auth/roles'

interface ApplicationStatus {
  hasApplication: boolean
  application?: {
    id: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    submittedAt: string
    reviewedAt?: string
    rejectionReason?: string
    companyName?: string
  }
}

export default function ContractorPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && session?.user) {
      // Check if user is already a contractor
      const userIsContractor = isContractor(session.user as any)

      if (userIsContractor) {
        // User is a contractor, redirect to dashboard
        router.push('/contractor/dashboard')
        return
      }

      // Check application status
      fetchApplicationStatus()
    }
  }, [status, session, router])

  const fetchApplicationStatus = async () => {
    try {
      const response = await fetch('/api/contractor/application-status')
      const data = await response.json()
      setApplicationStatus(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching application status:', error)
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // User is not authenticated
  if (status === 'unauthenticated') {
    return null
  }

  // Application Pending - redirect to dedicated application status page
  if (applicationStatus?.hasApplication && applicationStatus.application?.status === 'PENDING') {
    router.push('/contractor/application-status')
    return null
  }

  // Application Rejected
  if (applicationStatus?.hasApplication && applicationStatus.application?.status === 'REJECTED') {
    return (
      <section className="section-light min-h-screen p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="card-base card-dark p-4 md:p-6 lg:p-8">
            <div className="text-center mb-6 md:mb-8">
              <div className="inline-flex items-center justify-center w-14 md:w-16 h-14 md:h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <svg
                  className="w-7 md:w-8 h-7 md:h-8 text-red-600 dark:text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                Application Not Approved
              </h1>
              <p className="text-sm md:text-base text-secondary">
                Unfortunately, your application was not approved at this time.
              </p>
            </div>

            {applicationStatus.application?.rejectionReason && (
              <div className="badge-base bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 md:p-6 mb-6 md:mb-8 rounded-lg">
                <h2 className="font-semibold text-primary mb-2 md:mb-3 text-sm md:text-base">Reason for Decision</h2>
                <p className="text-secondary text-xs md:text-sm">
                  {applicationStatus.application.rejectionReason}
                </p>
              </div>
            )}
            <div className="badge-base bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 md:p-6 mb-6 md:mb-8 rounded-lg">
              <h3 className="font-semibold text-primary mb-2 md:mb-3 text-sm md:text-base">What Can You Do?</h3>
              <ul className="space-y-2 text-xs md:text-sm text-secondary list-disc list-inside">
                <li>Review the feedback and address any concerns</li>
                <li>Update your application with new information</li>
                <li>Contact support for more details or to appeal</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 md:gap-4">
              <button
                onClick={() => router.push('/contractor/onboarding')}
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition min-h-[44px]"
              >
                Resubmit Application
              </button>
              <Link
                href="/dashboard"
                className="block w-full px-4 md:px-6 py-3 md:py-4 bg-gray-200 dark:bg-gray-700 text-primary font-medium rounded text-center hover:bg-gray-300 dark:hover:bg-gray-600 transition min-h-[44px]"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // No application yet - show start flow
  return (
    <section className="section-accent min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="card-base card-dark rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 md:p-6 lg:p-8 text-white">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Become a Contractor</h1>
            <p className="text-sm md:text-base text-blue-100">
              Join our network of talented professionals and start earning on your terms
            </p>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6 lg:p-8">
            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-primary mb-4 md:mb-6">Why Become a Contractor?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="service-card">
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Work</h3>
                  <p className="text-secondary text-sm">Work on your own schedule and choose projects</p>
                </div>

                <div className="service-card">
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Pay</h3>
                  <p className="text-secondary text-sm">Get paid directly for quality work</p>
                </div>

                <div className="service-card">
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Your Network</h3>
                  <p className="text-secondary text-sm">Connect with other professionals</p>
                </div>

                <div className="service-card">
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Setup</h3>
                  <p className="text-secondary text-sm">Simple onboarding process</p>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="card-base card-light rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-primary mb-4">What We Need From You</h3>
              <ul className="space-y-3 text-sm text-secondary">
                <li className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Professional profile with contact information</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Verified email and phone number</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Portfolio or work samples (optional but recommended)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Your service expertise and experience</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <button
                onClick={() => router.push('/contractor/onboarding')}
                className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition text-base md:text-lg min-h-[44px]"
              >
                Get Started
              </button>
              <Link
                href="/dashboard"
                className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-center text-base md:text-lg min-h-[44px]"
              >
                Learn More
              </Link>
            </div>

            <p className="text-xs md:text-sm text-secondary text-center mt-4 md:mt-6">
              Already have an application?{' '}
              <Link
                href="/contractor/application-status"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Check status
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
