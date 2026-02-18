'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/app/lib/utils'

interface DashboardData {
  totalEarnings: number
  pendingPayments: number
  completedProjects: number
  onboardingComplete: boolean
  completedAssignments: Array<{
    id: string
    projectId: string
    projectName: string
    customerName: string
    paymentAmount: number
    paymentStatus: string
    paymentDueDate: string | null
    completedAt: string | null
  }>
  paymentHistory: Array<{
    id: string
    amount: number
    status: string
    processedAt: string
    stripeTransferId: string | null
  }>
}

export default function ContractorPaymentsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openingDashboard, setOpeningDashboard] = useState(false)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/contractor/payments/dashboard')
        if (!response.ok) throw new Error('Failed to fetch payment dashboard')
        const dashboardData = await response.json()
        setData(dashboardData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load payment dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const handleOpenStripeDashboard = async () => {
    setOpeningDashboard(true)
    try {
      const response = await fetch('/api/contractor/payments/dashboard-link')
      if (!response.ok) throw new Error('Failed to get Stripe dashboard link')
      const { dashboardUrl } = await response.json()
      window.open(dashboardUrl, '_blank')
    } catch (err) {
      console.error('Error opening Stripe dashboard:', err)
      alert('Failed to open Stripe dashboard. Please try again.')
    } finally {
      setOpeningDashboard(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-300">Loading payment dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/contractor" className="text-red-500 hover:text-red-400">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Show onboarding card if not complete
  if (!data || !data.onboardingComplete) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Set Up Your Payment Method</h2>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Before you can receive payments for completed projects, you need to set up your bank account with Stripe. This takes just a few minutes and is completely secure.
            </p>

            <div className="bg-gray-900 rounded-lg p-6 mb-6 text-left space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-md bg-blue-600 text-white text-sm font-medium">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-white">Link your bank account</h3>
                  <p className="text-sm text-gray-400">Provide your bank details for direct deposits</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-md bg-blue-600 text-white text-sm font-medium">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-white">Start earning payments</h3>
                  <p className="text-sm text-gray-400">Get paid when projects are completed and processed</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-md bg-blue-600 text-white text-sm font-medium">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-white">Track your earnings</h3>
                  <p className="text-sm text-gray-400">View all your payments and earnings history</p>
                </div>
              </div>
            </div>

            <Link
              href="/contractor/payments/onboarding"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Start Payment Setup →
            </Link>

            <p className="text-sm text-gray-400 mt-6">
              We use Stripe to securely handle payments. Your financial information is encrypted and protected.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Payment Dashboard</h1>
            <p className="text-gray-400">Manage your contractor payments and earnings</p>
          </div>
          <button
            onClick={handleOpenStripeDashboard}
            disabled={openingDashboard}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {openingDashboard ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Opening...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-4l6-6m0 0v6m0-6H8" />
                </svg>
                View Stripe Account
              </>
            )}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Earnings</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {formatCurrency(data.totalEarnings)}
                </p>
              </div>
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Pending Payments</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {formatCurrency(data.pendingPayments)}
                </p>
              </div>
              <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Completed Projects</p>
                <p className="text-3xl font-bold text-white mt-2">{data.completedProjects}</p>
              </div>
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Completed Projects Table */}
        {data.completedAssignments.length > 0 && (
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Completed Projects</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Payment Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {data.completedAssignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-700 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/contractor/projects/${assignment.projectId}`}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {assignment.projectName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {assignment.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {formatCurrency(assignment.paymentAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          assignment.paymentStatus === 'PAID' ? 'bg-green-900 text-green-200' :
                          assignment.paymentStatus === 'PENDING' ? 'bg-yellow-900 text-yellow-200' :
                          assignment.paymentStatus === 'PROCESSING' ? 'bg-blue-900 text-blue-200' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {assignment.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {assignment.paymentDueDate
                          ? new Date(assignment.paymentDueDate).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payment History */}
        {data.paymentHistory.length > 0 && (
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Payment History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Transfer ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {data.paymentHistory.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-700 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(payout.processedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {formatCurrency(payout.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payout.status === 'COMPLETED' ? 'bg-green-900 text-green-200' :
                          payout.status === 'PROCESSING' ? 'bg-blue-900 text-blue-200' :
                          payout.status === 'PENDING' ? 'bg-yellow-900 text-yellow-200' :
                          'bg-red-900 text-red-200'
                        }`}>
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                        {payout.stripeTransferId ? payout.stripeTransferId.substring(0, 16) + '...' : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {data.completedAssignments.length === 0 && data.paymentHistory.length === 0 && (
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-8 text-center">
            <p className="text-gray-400 mb-4">No completed projects or payment history yet</p>
            <Link
              href="/contractor/projects"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium"
            >
              View Assigned Projects →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
