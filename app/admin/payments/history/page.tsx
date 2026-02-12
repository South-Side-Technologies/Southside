'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/app/lib/utils'

interface PayoutHistory {
  id: string
  contractorId: string
  contractorName: string
  contractorEmail: string
  amount: number
  status: string
  processedAt: string
  completedAt: string | null
  stripeTransferId: string | null
  failureReason: string | null
  projectCount: number
}

export default function AdminPaymentHistoryPage() {
  const [payouts, setPayouts] = useState<PayoutHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchPayoutHistory()
  }, [statusFilter])

  const fetchPayoutHistory = async () => {
    try {
      setIsLoading(true)
      const url = statusFilter === 'all'
        ? '/api/admin/payments/history'
        : `/api/admin/payments/history?status=${statusFilter}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch payment history')
      }

      const data = await response.json()
      setPayouts(data.payouts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment history')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }

  const getTotalAmount = () => {
    return payouts
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-700 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading payment history...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment History</h1>
          <p className="text-gray-600">View all processed contractor payments</p>
        </div>
        <Link
          href="/admin/payments"
          className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Manage Payments
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {payouts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600 text-sm font-medium">Total Completed</p>
            <p className="text-3xl font-bold text-green-700 mt-2">{formatCurrency(getTotalAmount())}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600 text-sm font-medium">Total Payouts</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{payouts.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600 text-sm font-medium">Unique Contractors</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {new Set(payouts.map((p) => p.contractorId)).size}
            </p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-6">
        <div className="flex gap-2">
          {['all', 'COMPLETED', 'PROCESSING', 'PENDING', 'FAILED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-red-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : formatStatus(status)}
            </button>
          ))}
        </div>
      </div>

      {payouts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment History</h3>
          <p className="text-gray-600">No payouts have been processed yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contractor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transfer ID
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payout.processedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{payout.contractorName}</p>
                        <p className="text-sm text-gray-600">{payout.contractorEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payout.projectCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(payout.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          payout.status
                        )}`}
                        title={payout.failureReason || undefined}
                      >
                        {formatStatus(payout.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                      {payout.stripeTransferId ? (
                        <code title={payout.stripeTransferId} className="text-xs">
                          {payout.stripeTransferId.substring(0, 12)}...
                        </code>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
