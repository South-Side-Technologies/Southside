'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/app/lib/utils'

interface ContractorPaymentInfo {
  id: string
  email: string
  name: string | null
  pendingAmount: number
  assignmentCount: number
  stripeOnboardingComplete: boolean
}

interface PaymentBatch {
  contractorId: string
  amount: number
}

export default function AdminPaymentsPage() {
  const [contractors, setContractors] = useState<ContractorPaymentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContractors, setSelectedContractors] = useState<Set<string>>(new Set())
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchContractors()
  }, [])

  const fetchContractors = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/payments/pending')
      if (!response.ok) throw new Error('Failed to fetch pending payments')
      const data = await response.json()
      setContractors(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending payments')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContractors(
        new Set(contractors.filter(c => c.stripeOnboardingComplete).map(c => c.id))
      )
    } else {
      setSelectedContractors(new Set())
    }
  }

  const handleSelectContractor = (contractorId: string, checked: boolean) => {
    const newSelected = new Set(selectedContractors)
    if (checked) {
      newSelected.add(contractorId)
    } else {
      newSelected.delete(contractorId)
    }
    setSelectedContractors(newSelected)
  }

  const handleProcessPayments = async () => {
    if (selectedContractors.size === 0) {
      setError('Please select at least one contractor')
      return
    }

    if (!confirm(`Process payments for ${selectedContractors.size} contractor(s)?`)) {
      return
    }

    setProcessing(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const payload: PaymentBatch[] = contractors
        .filter(c => selectedContractors.has(c.id))
        .map(c => ({
          contractorId: c.id,
          amount: c.pendingAmount,
        }))

      const response = await fetch('/api/admin/payments/process-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payments: payload }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to process payments')
      }

      setSuccessMessage(
        `Successfully processed payments for ${selectedContractors.size} contractor(s)`
      )
      setSelectedContractors(new Set())
      fetchContractors()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payments')
    } finally {
      setProcessing(false)
    }
  }

  const totalSelected = Array.from(selectedContractors)
    .reduce((sum, id) => {
      const contractor = contractors.find(c => c.id === id)
      return sum + (contractor?.pendingAmount || 0)
    }, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading payment data...</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Contractor Payments</h1>
        <p className="text-gray-600">Manage and process batch payments to contractors</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Total Pending</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {formatCurrency(
              contractors.reduce((sum, c) => sum + c.pendingAmount, 0)
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {contractors.filter(c => c.pendingAmount > 0).length} contractors
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Selected Amount</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {formatCurrency(totalSelected)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {selectedContractors.size} contractor(s) selected
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Onboarded</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {contractors.filter(c => c.stripeOnboardingComplete).length}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Ready for payments
          </p>
        </div>
      </div>

      {/* Contractors Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Pending Payments</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      contractors.filter(c => c.stripeOnboardingComplete).length > 0 &&
                      contractors.filter(c => c.stripeOnboardingComplete).every(c => selectedContractors.has(c.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contractor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contractors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No pending payments
                  </td>
                </tr>
              ) : (
                contractors.map((contractor) => (
                  <tr key={contractor.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        disabled={!contractor.stripeOnboardingComplete}
                        checked={selectedContractors.has(contractor.id)}
                        onChange={(e) => handleSelectContractor(contractor.id, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 disabled:opacity-50"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{contractor.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{contractor.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {contractor.assignmentCount}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatCurrency(contractor.pendingAmount)}
                    </td>
                    <td className="px-6 py-4">
                      {contractor.stripeOnboardingComplete ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending Setup
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      {contractors.some(c => c.pendingAmount > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ready to process?</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedContractors.size > 0
                  ? `You have selected ${selectedContractors.size} contractor(s) for a total of ${formatCurrency(totalSelected)}`
                  : 'Select contractors above to process payments'}
              </p>
            </div>
            <button
              onClick={handleProcessPayments}
              disabled={selectedContractors.size === 0 || processing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              {processing ? 'Processing...' : 'Process Selected Payments'}
            </button>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link
          href="/admin/payments/history"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
        >
          View Payment History →
        </Link>
      </div>
    </>
  )
}