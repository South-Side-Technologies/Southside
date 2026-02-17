'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

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

export default function ApplicationStatusPage() {
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
      <div className="flex items-center justify-center min-h-screen bg-gray-800"
        <<div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-400 application status...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  // No application found
  if (!applicationStatus?.hasApplication) {
    return ("
      <<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-gray-400
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                No Application Found
              </h1>
              <p className="text-gray-400
                You haven't submitted a contractor application yet.
              </p>
            </div>"
            <<div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="font-semibold text-gray-900 mb-3">Get Started</h2>
              <p className="text-gray-300 text-sm mb-4">
                Ready to become a contractor? Complete the application to join our network of professionals.
              </p>
            </div>

            <div className="flex gap-4">
              <Link
                href="/contractor/onboarding"
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition text-center"
              >
                Start Application
              </Link>
              <Link
                href="/contractor"
                className="flex-1 px-6 py-3 bg-gray-800 text-gray-900 font-medium rounded hover:bg-gray-700 transition text-center"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Application Pending
  if (applicationStatus.application?.status === 'PENDING') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-yellow-600
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Application Under Review
              </h1>
              <p className="text-gray-400
                Your contractor application is being reviewed by our team.
              </p>
            </div>"
            <<div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="font-semibold text-gray-900 mb-4">Application Details</h2>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-400"
                  <<dd className="font-medium">
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      Pending Review
                    </span>
                  </dd>
                </div>
                {applicationStatus.application?.companyName && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400"
                    <<dd className="font-medium text-gray-900
                      {applicationStatus.application.companyName}
                    </dd>
                  </div>
                )}"
                <<div className="flex justify-between">
                  <dt className="text-gray-400"
                  <<dd className="font-medium text-gray-900
                    {new Date(applicationStatus.application!.submittedAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>"
            <<div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
              <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
                <li>Our team will review your application and background</li>
                <li>We may contact you for additional information</li>
                <li>Once approved, you'll gain access to the contractor dashboard</li>
                <li>You can then set up payments and start accepting projects</li>
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">In the Meantime</h3>
              <p className="text-sm text-gray-300
                You can set up your payment information now so you're ready to receive payouts as soon as your application is approved.
              </p>
            </div>"
            <<div className="space-y-4">
              <p className="text-sm text-gray-400 text-center">
                This usually takes 1-3 business days. We'll notify you once your
                application is approved or if we need more information.
              </p>
              <Link
                href="/contractor/payments"
                className="block w-full px-6 py-3 bg-green-600 text-white font-medium rounded text-center hover:bg-green-700 transition"
              >
                Set Up Payments
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Application Rejected
  if (applicationStatus.application?.status === 'REJECTED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-red-600
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Application Not Approved
              </h1>
              <p className="text-gray-400
                Unfortunately, your application was not approved at this time.
              </p>
            </div>

            {applicationStatus.application?.rejectionReason && ("
              <<div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <h2 className="font-semibold text-gray-900 mb-3">Reason for Decision</h2>
                <p className="text-gray-300
                  {applicationStatus.application.rejectionReason}
                </p>
              </div>
            )}"
            <<div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">What Can You Do?</h3>
              <ul className="space-y-2 text-sm text-gray-300 list-disc list-inside">
                <li>Review the feedback and address any concerns</li>
                <li>Update your application with new information</li>
                <li>Contact support for more details or to appeal</li>
              </ul>
            </div>

            <Link
              href="/contractor/onboarding"
              className="block w-full px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition text-center"
            >
              Resubmit Application
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Application Approved
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Congratulations! 🎉
            </h1>
            <p className="text-gray-400
              Your contractor application has been approved!
            </p>
          </div>"
          <<div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">You're All Set</h2>
            <p className="text-gray-300 text-sm mb-4">
              Your contractor profile is now active. You can access the contractor dashboard and start reviewing projects.
            </p>
            <p className="text-sm text-gray-400
              If you haven't already, set up your payment information to receive payouts.
            </p>
          </div>"
          <<div className="flex gap-4">
            <Link
              href="/contractor/dashboard"
              className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition text-center"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/contractor/payments"
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition text-center"
            >
              Set Up Payments
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
