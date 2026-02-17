'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/app/lib/utils'

interface Assignment {
  id: string
  projectId: string
  projectName: string
  projectStatus: string
  paymentAmount: number
  approvedForPayment: boolean | null
  approvedBy: string | null
  approvedAt: string | null
  rejectionReason: string | null
  reviewNotes: string | null
  assignedAt: string
}

interface ContractorGroup {
  contractorId: string
  contractorName: string
  contractorEmail: string
  stripeOnboardingComplete: boolean
  totalPending: number
  totalApproved: number
  totalRejected: number
  assignments: Assignment[]
}

interface PaymentBatch {
  contractorId: string
  amount: number
}

type ApprovalStatus = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<'review' | 'process'>('review')
  const [contractors, setContractors] = useState<ContractorGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Review tab state
  const [approvalFilter, setApprovalFilter] = useState<ApprovalStatus>('pending')
  const [expandedContractors, setExpandedContractors] = useState<Set<string>>(new Set())
  const [selectedAssignments, setSelectedAssignments] = useState<Set<string>>(new Set())
  const [modals, setModals] = useState<{
    type: 'reject' | 'edit' | null
    assignmentId: string | null
  }>({ type: null, assignmentId: null })

  // Process batch state
  const [selectedContractors, setSelectedContractors] = useState<Set<string>>(new Set())
  const [processing, setProcessing] = useState(false)

  // Modal form state
  const [rejectReason, setRejectReason] = useState('')
  const [editAmount, setEditAmount] = useState<number | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [approvalFilter])

  const fetchPayments = async () => {
    setLoading(true)
    setError(null)

    try {
      const url = new URL('/api/admin/payments/pending', window.location.origin)
      url.searchParams.set('view', 'contractor')
      url.searchParams.set('status', approvalFilter)

      const response = await fetch(url.toString())
      if (!response.ok) throw new Error('Failed to fetch pending payments')
      const data = await response.json()
      setContractors(data.contractors || [])
      setSelectedAssignments(new Set())
      setSelectedContractors(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending payments')
    } finally {
      setLoading(false)
    }
  }

  const toggleContractor = (contractorId: string) => {
    const newExpanded = new Set(expandedContractors)
    if (newExpanded.has(contractorId)) {
      newExpanded.delete(contractorId)
    } else {
      newExpanded.add(contractorId)
    }
    setExpandedContractors(newExpanded)
  }

  const handleAssignmentAction = async (
    assignmentId: string,
    action: 'approve' | 'reject' | 'edit'
  ) => {
    if (action === 'reject') {
      setModals({ type: 'reject', assignmentId })
    } else if (action === 'edit') {
      const assignment = contractors
        .flatMap((c) => c.assignments)
        .find((a) => a.id === assignmentId)
      setEditAmount(assignment?.paymentAmount || null)
      setModals({ type: 'edit', assignmentId })
    } else if (action === 'approve') {
      await approveAssignment(assignmentId)
    }
  }

  const approveAssignment = async (assignmentId: string) => {
    try {
      const response = await fetch(
        `/api/admin/payments/assignments/${assignmentId}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reviewNotes }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to approve assignment')
      }

      setSuccessMessage('Assignment approved successfully')
      setReviewNotes('')
      fetchPayments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve assignment')
    }
  }

  const submitRejectModal = async () => {
    if (!modals.assignmentId) return

    if (!rejectReason.trim()) {
      setError('Rejection reason is required')
      return
    }

    try {
      const response = await fetch(
        `/api/admin/payments/assignments/${modals.assignmentId}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rejectionReason: rejectReason, reviewNotes }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reject assignment')
      }

      setSuccessMessage('Assignment rejected')
      setRejectReason('')
      setReviewNotes('')
      setModals({ type: null, assignmentId: null })
      fetchPayments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject assignment')
    }
  }

  const submitEditModal = async () => {
    if (!modals.assignmentId || editAmount === null) return

    if (editAmount <= 0) {
      setError('Payment amount must be greater than 0')
      return
    }

    try {
      const response = await fetch(
        `/api/admin/payments/assignments/${modals.assignmentId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentAmount: editAmount, reviewNotes }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update payment amount')
      }

      setSuccessMessage('Payment amount updated. Please review again.')
      setEditAmount(null)
      setReviewNotes('')
      setModals({ type: null, assignmentId: null })
      fetchPayments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment amount')
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContractors(
        new Set(contractors.filter((c) => c.stripeOnboardingComplete).map((c) => c.contractorId))
      )
    } else {
      setSelectedContractors(new Set())
    }
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
        .filter((c) => selectedContractors.has(c.contractorId))
        .map((c) => ({
          contractorId: c.contractorId,
          amount: c.totalApproved,
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
      setApprovalFilter('pending') // Reset to pending view
      fetchPayments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payments')
    } finally {
      setProcessing(false)
    }
  }

  // Calculate totals for summaries
  const allAssignments = contractors.flatMap((c) => c.assignments)
  const summary = {
    totalNotReviewed: allAssignments
      .filter((a) => a.approvedForPayment === null)
      .reduce((sum, a) => sum + a.paymentAmount, 0),
    totalApproved: allAssignments
      .filter((a) => a.approvedForPayment === true)
      .reduce((sum, a) => sum + a.paymentAmount, 0),
    totalRejected: allAssignments
      .filter((a) => a.approvedForPayment === false)
      .reduce((sum, a) => sum + a.paymentAmount, 0),
  }

  const totalSelected = Array.from(selectedContractors)
    .reduce((sum, id) => {
      const contractor = contractors.find((c) => c.contractorId === id)
      return sum + (contractor?.totalApproved || 0)
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
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Contractor Payments
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Review and process contractor payouts</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-700 dark:text-green-300">{successMessage}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('review')}
            className={`py-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'review'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            📋 Review Assignments
          </button>
          <button
            onClick={() => setActiveTab('process')}
            className={`py-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'process'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            💳 Process Payments
          </button>
        </div>
      </div>

      {/* Review Assignments Tab */}
      {activeTab === 'review' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Not Reviewed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(summary.totalNotReviewed)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {allAssignments.filter((a) => a.approvedForPayment === null).length} assignments
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {formatCurrency(summary.totalApproved)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {allAssignments.filter((a) => a.approvedForPayment === true).length} assignments
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {formatCurrency(summary.totalRejected)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {allAssignments.filter((a) => a.approvedForPayment === false).length} assignments
              </p>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-6 flex gap-4">
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value as ApprovalStatus)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="pending">Not Reviewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
          </div>

          {/* Contractor Groups */}
          <div className="space-y-4">
            {contractors.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No assignments to review</p>
              </div>
            ) : (
              contractors.map((contractor) => (
                <div
                  key={contractor.contractorId}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Contractor Header */}
                  <button
                    onClick={() => toggleContractor(contractor.contractorId)}
                    className="w-full px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-xl">
                        {expandedContractors.has(contractor.contractorId) ? '▼' : '▶'}
                      </span>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {contractor.contractorName || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {contractor.contractorEmail}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {contractor.totalPending > 0 && (
                            <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                              {formatCurrency(contractor.totalPending)} pending •{' '}
                            </span>
                          )}
                          {contractor.totalApproved > 0 && (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {formatCurrency(contractor.totalApproved)} approved
                            </span>
                          )}
                        </p>
                      </div>
                      {!contractor.stripeOnboardingComplete && (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded font-medium">
                          ⚠️ Setup Pending
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Expanded Assignments */}
                  {expandedContractors.has(contractor.contractorId) && (
                    <div className="border-t border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                      {contractor.assignments.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          No assignments
                        </div>
                      ) : (
                        contractor.assignments.map((assignment) => (
                          <div key={assignment.id} className="px-6 py-4">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {assignment.projectName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Amount: {formatCurrency(assignment.paymentAmount)}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {assignment.approvedForPayment === null && (
                                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded font-medium">
                                    Pending Review
                                  </span>
                                )}
                                {assignment.approvedForPayment === true && (
                                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded font-medium">
                                    ✓ Approved
                                  </span>
                                )}
                                {assignment.approvedForPayment === false && (
                                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs rounded font-medium">
                                    ✗ Rejected
                                  </span>
                                )}
                              </div>
                            </div>

                            {assignment.rejectionReason && (
                              <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                <p className="text-sm text-red-700 dark:text-red-300">
                                  <strong>Rejection reason:</strong> {assignment.rejectionReason}
                                </p>
                              </div>
                            )}

                            {assignment.reviewNotes && (
                              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  <strong>Notes:</strong> {assignment.reviewNotes}
                                </p>
                              </div>
                            )}

                            {assignment.approvedForPayment === null && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAssignmentAction(assignment.id, 'approve')}
                                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded font-medium transition"
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  onClick={() => handleAssignmentAction(assignment.id, 'reject')}
                                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-medium transition"
                                >
                                  ✗ Reject
                                </button>
                                <button
                                  onClick={() => handleAssignmentAction(assignment.id, 'edit')}
                                  className="px-3 py-1.5 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm rounded font-medium transition"
                                >
                                  ✎ Edit Amount
                                </button>
                              </div>
                            )}

                            {assignment.approvedForPayment === true && (
                              <button
                                onClick={() => handleAssignmentAction(assignment.id, 'reject')}
                                className="px-3 py-1.5 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm rounded font-medium transition"
                              >
                                Revert to Review
                              </button>
                            )}

                            {assignment.approvedForPayment === false && (
                              <button
                                onClick={() => handleAssignmentAction(assignment.id, 'approve')}
                                className="px-3 py-1.5 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm rounded font-medium transition"
                              >
                                Approve
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Process Payments Tab */}
      {activeTab === 'process' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Approved</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(
                  contractors.reduce((sum, c) => sum + c.totalApproved, 0)
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {contractors.filter((c) => c.totalApproved > 0).length} contractors
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Selected Amount</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {formatCurrency(totalSelected)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {selectedContractors.size} contractor(s) selected
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Onboarded</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {contractors.filter((c) => c.stripeOnboardingComplete).length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Ready for payments</p>
            </div>
          </div>

          {/* Contractors Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Approved Payments
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          contractors.filter((c) => c.stripeOnboardingComplete && c.totalApproved > 0)
                            .length > 0 &&
                          contractors
                            .filter((c) => c.stripeOnboardingComplete && c.totalApproved > 0)
                            .every((c) => selectedContractors.has(c.contractorId))
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contractor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Approved Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Assignments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {contractors.filter((c) => c.totalApproved > 0).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No approved payments to process
                      </td>
                    </tr>
                  ) : (
                    contractors
                      .filter((c) => c.totalApproved > 0)
                      .map((contractor) => (
                        <tr key={contractor.contractorId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              disabled={!contractor.stripeOnboardingComplete}
                              checked={selectedContractors.has(contractor.contractorId)}
                              onChange={(e) =>
                                handleSelectContractor(contractor.contractorId, e.target.checked)
                              }
                              className="w-4 h-4 rounded border-gray-300 disabled:opacity-50"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {contractor.contractorName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {contractor.contractorEmail}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(contractor.totalApproved)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                            {contractor.assignments.filter((a) => a.approvedForPayment === true)
                              .length}
                          </td>
                          <td className="px-6 py-4">
                            {contractor.stripeOnboardingComplete ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                Ready
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                                ⚠️ Setup Pending
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
          {contractors.some((c) => c.totalApproved > 0) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Ready to process?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedContractors.size > 0
                      ? `You have selected ${selectedContractors.size} contractor(s) for a total of ${formatCurrency(totalSelected)}`
                      : 'Select contractors above to process payments'}
                  </p>
                </div>
                <button
                  onClick={handleProcessPayments}
                  disabled={selectedContractors.size === 0 || processing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  {processing ? 'Processing...' : 'Process Selected Payments'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {modals.type === 'reject' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reject Payment</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Why are you rejecting this payment?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setModals({ type: null, assignmentId: null })
                  setRejectReason('')
                  setReviewNotes('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitRejectModal}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {modals.type === 'edit' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Payment Amount</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Amount *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editAmount || ''}
                    onChange={(e) => setEditAmount(e.target.value ? parseFloat(e.target.value) : null)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                  placeholder="Why are you changing the amount?"
                />
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  ℹ️ Changing the amount will reset the approval status and require re-review.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setModals({ type: null, assignmentId: null })
                  setEditAmount(null)
                  setReviewNotes('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitEditModal}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Update Amount
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link
          href="/admin/payments/history"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
        >
          View Payment History →
        </Link>
      </div>
    </>
  )
}
