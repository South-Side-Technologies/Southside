'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ContractorApplication {
  id: string
  userId: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  submittedAt: string
  reviewedAt?: string
  rejectionReason?: string
  companyName?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  bio?: string
  serviceCategories?: string[]
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  bankAccountName?: string
  bankAccountType?: string
  user: {
    id: string
    name: string
    email: string
  }
}

export default function ContractorsPage() {
  const [applications, setApplications] = useState<ContractorApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approving, setApproving] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/contractors/applications')
      if (!response.ok) throw new Error('Failed to fetch applications')
      const data = await response.json()
      setApplications(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (appId: string) => {
    setApproving(appId)
    try {
      const response = await fetch(`/api/admin/contractors/applications/${appId}/approve`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to approve application')
      setApplications(apps => apps.map(app =>
        app.id === appId ? { ...app, status: 'APPROVED' as const } : app
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve')
    } finally {
      setApproving(null)
    }
  }

  const handleReject = async (appId: string) => {
    const trimmedReason = rejectionReason.trim()
    if (!trimmedReason || trimmedReason.length < 10) {
      setError('Please provide a rejection reason (at least 10 characters)')
      return
    }
    setRejecting(appId)
    try {
      const response = await fetch(`/api/admin/contractors/applications/${appId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: trimmedReason }),
      })
      if (!response.ok) throw new Error('Failed to reject application')
      setApplications(apps => apps.map(app =>
        app.id === appId ? { ...app, status: 'REJECTED' as const, rejectionReason: trimmedReason } : app
      ))
      setSelectedAppId(null)
      setRejectionReason('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject')
    } finally {
      setRejecting(null)
    }
  }


  const pendingApps = applications.filter(a => a.status === 'PENDING')
  const approvedApps = applications.filter(a => a.status === 'APPROVED')
  const rejectedApps = applications.filter(a => a.status === 'REJECTED')

  const filteredApplications = applications
    .filter(a => statusFilter === 'all' || a.status === statusFilter)
    .filter(a => {
      const query = searchQuery.toLowerCase()
      return (
        a.user.name?.toLowerCase().includes(query) ||
        a.user.email?.toLowerCase().includes(query) ||
        a.firstName?.toLowerCase().includes(query) ||
        a.lastName?.toLowerCase().includes(query) ||
        a.companyName?.toLowerCase().includes(query)
      )
    })

  if (loading) {
    return <div className="p-8 text-center">Loading applications...</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contractor Applications</h1>
        <p className="text-gray-600">Review and approve contractor applications</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`bg-white rounded-xl p-6 shadow-sm border ${
            statusFilter === 'all' || statusFilter === 'PENDING'
              ? 'border-yellow-200 bg-yellow-50'
              : 'border-gray-200'
          } cursor-pointer transition-colors hover:shadow-md`}
          onClick={() => setStatusFilter(statusFilter === 'PENDING' ? 'all' : 'PENDING')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Pending Applications</span>
            <span className="text-2xl">⏳</span>
          </div>
          <p className="text-3xl font-bold text-yellow-700">{pendingApps.length}</p>
          <p className="text-sm text-gray-500 mt-2">Awaiting review</p>
        </div>

        <div
          className={`bg-white rounded-xl p-6 shadow-sm border ${
            statusFilter === 'all' || statusFilter === 'APPROVED'
              ? 'border-green-200 bg-green-50'
              : 'border-gray-200'
          } cursor-pointer transition-colors hover:shadow-md`}
          onClick={() => setStatusFilter(statusFilter === 'APPROVED' ? 'all' : 'APPROVED')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Approved Applications</span>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-3xl font-bold text-green-700">{approvedApps.length}</p>
          <p className="text-sm text-gray-500 mt-2">Active contractors</p>
        </div>

        <div
          className={`bg-white rounded-xl p-6 shadow-sm border ${
            statusFilter === 'all' || statusFilter === 'REJECTED'
              ? 'border-red-200 bg-red-50'
              : 'border-gray-200'
          } cursor-pointer transition-colors hover:shadow-md`}
          onClick={() => setStatusFilter(statusFilter === 'REJECTED' ? 'all' : 'REJECTED')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Rejected Applications</span>
            <span className="text-2xl">❌</span>
          </div>
          <p className="text-3xl font-bold text-red-700">{rejectedApps.length}</p>
          <p className="text-sm text-gray-500 mt-2">Did not qualify</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Applications List */}
      <div>
        {filteredApplications.length === 0 ? (
          <p className="text-gray-600">No applications found</p>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map(app => (
              <Link
                key={app.id}
                href={`/admin/contractors/${app.id}`}
              >
                <div
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition cursor-pointer"
                >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{app.user.name}</h3>
                    <p className="text-sm text-gray-600">{app.user.email}</p>
                    {app.companyName && (
                      <p className="text-sm text-gray-600 mt-1">{app.companyName}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      app.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : app.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {app.status === 'PENDING' ? 'Pending' : app.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                  </span>
                </div>

                <div className="mt-4">
                  {app.status === 'PENDING' ? (
                    selectedAppId === app.id ? (
                      <div
                        className="p-4 bg-red-50 border border-red-200 rounded-lg"
                        onClick={(e) => e.preventDefault()}
                      >
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Rejection Reason
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
                          rows={2}
                          placeholder="Explain why the application was rejected..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(app.id)}
                            disabled={rejecting === app.id}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-xs font-medium"
                          >
                            {rejecting === app.id ? 'Rejecting...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setSelectedAppId(null)}
                            className="px-3 py-1 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 text-xs font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex gap-2 justify-end"
                        onClick={(e) => e.preventDefault()}
                      >
                        <button
                          onClick={() => handleApprove(app.id)}
                          disabled={approving === app.id}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-xs font-medium"
                        >
                          {approving === app.id ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => setSelectedAppId(app.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    )
                  ) : app.status === 'APPROVED' ? (
                    <p className="text-xs text-green-600 font-medium">
                      Approved on {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 font-medium">
                      Rejected on {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : 'N/A'}
                      {app.rejectionReason && (
                        <span className="block text-gray-700 mt-1">Reason: {app.rejectionReason}</span>
                      )}
                    </p>
                  )}
                </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
