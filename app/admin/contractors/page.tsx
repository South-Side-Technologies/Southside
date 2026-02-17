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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-secondary">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Contractor Applications</h1>
        <p className="text-secondary">Review and approve contractor applications</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`stat-card cursor-pointer transition-colors ${
            statusFilter === 'all' || statusFilter === 'PENDING'
              ? 'ring-2 ring-yellow-500 bg-yellow-500/10'
              : ''
          }`}
          onClick={() => setStatusFilter(statusFilter === 'PENDING' ? 'all' : 'PENDING')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Pending Applications</span>
            <span className="text-2xl">⏳</span>
          </div>
          <p className="stat-value text-yellow-400">{pendingApps.length}</p>
          <p className="stat-subtext">Awaiting review</p>
        </div>

        <div
          className={`stat-card cursor-pointer transition-colors ${
            statusFilter === 'all' || statusFilter === 'APPROVED'
              ? 'ring-2 ring-green-500 bg-green-500/10'
              : ''
          }`}
          onClick={() => setStatusFilter(statusFilter === 'APPROVED' ? 'all' : 'APPROVED')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Approved Applications</span>
            <span className="text-2xl">✅</span>
          </div>
          <p className="stat-value text-green-400">{approvedApps.length}</p>
          <p className="stat-subtext">Active contractors</p>
        </div>

        <div
          className={`stat-card cursor-pointer transition-colors ${
            statusFilter === 'all' || statusFilter === 'REJECTED'
              ? 'ring-2 ring-red-500 bg-red-900/200/10'
              : ''
          }`}
          onClick={() => setStatusFilter(statusFilter === 'REJECTED' ? 'all' : 'REJECTED')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Rejected Applications</span>
            <span className="text-2xl">❌</span>
          </div>
          <p className="stat-value text-red-400">{rejectedApps.length}</p>
          <p className="stat-subtext">Did not qualify</p>
        </div>
      </div>

      {error && (
        <div className="alert-error">
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
          className="form-input w-full"
        />
      </div>

      {/* Applications List */}
      <div>
        {filteredApplications.length === 0 ? (
          <p className="text-secondary">No applications found</p>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map(app => (
              <Link
                key={app.id}
                href={`/admin/contractors/${app.id}`}
              >
                <div className="card-light hover:shadow-md hover:ring-2 hover:ring-blue-500/30 transition cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-primary">{app.user.name}</h3>
                    <p className="text-sm text-secondary">{app.user.email}</p>
                    {app.companyName && (
                      <p className="text-sm text-secondary mt-1">{app.companyName}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      app.status === 'PENDING'
                        ? 'badge-warning'
                        : app.status === 'APPROVED'
                        ? 'badge-success'
                        : 'badge-error'
                    }`}
                  >
                    {app.status === 'PENDING' ? 'Pending' : app.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                  </span>
                </div>

                <div className="mt-4">
                  {app.status === 'PENDING' ? (
                    selectedAppId === app.id ? (
                      <div
                        className="p-4 alert-error rounded-lg"
                        onClick={(e) => e.preventDefault()}
                      >
                        <label className="form-label mb-2">Rejection Reason</label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="form-textarea w-full mb-3"
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
                            className="px-3 py-1 btn-filter-inactive"
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
                          className="px-3 py-1 badge-error cursor-pointer"
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
                    <p className="text-xs text-red-400 font-medium">
                      Rejected on {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : 'N/A'}
                      {app.rejectionReason && (
                        <span className="block text-primary mt-1">Reason: {app.rejectionReason}</span>
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
