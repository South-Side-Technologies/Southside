'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

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
  user: {
    id: string
    name: string
    email: string
    stripeOnboardingComplete?: boolean
    stripeConnectAccountId?: string
  }
}

export default function ContractorDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [application, setApplication] = useState<ContractorApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<ContractorApplication> | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchApplication()
  }, [id])

  const fetchApplication = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/contractors/applications/${id}`)
      if (!response.ok) throw new Error('Failed to fetch application')
      const data = await response.json()
      setApplication(data)
      setEditData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load application')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editData) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/contractors/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      if (!response.ok) throw new Error('Failed to update application')
      const updated = await response.json()
      setApplication(updated)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData(application)
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-400">Loading contractor information...</p>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="p-8">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-700 mb-4">Contractor application not found</p>
          <Link href="/admin/contractors" className="text-blue-600 hover:underline">
            Back to Contractors
          </Link>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-300'
      default:
        return 'bg-gray-800 text-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/contractors"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Contractors
          </Link>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Edit
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Title Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {application.firstName} {application.lastName}
            </h1>
            <p className="text-gray-400 mt-1">{application.user.email}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
            {application.status === 'PENDING'
              ? 'Pending'
              : application.status === 'APPROVED'
              ? 'Approved'
              : 'Rejected'}
          </span>
        </div>

        {application.companyName && (
          <p className="text-gray-400">
            <span className="font-medium text-white">Company:</span> {application.companyName}
          </p>
        )}
      </div>

      {isEditing ? (
        /* Edit Mode */
        <div className="bg-gray-800 rounded-xl border border-blue-200 bg-blue-50 p-8">
          <h2 className="text-xl font-bold text-white mb-6">Edit Contractor Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
            </div>
            <label className="block">
              <span className="block text-sm font-medium text-white mb-1">First Name</span>
              <input
                type="text"
                value={editData?.firstName || ''}
                onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-white mb-1">Last Name</span>
              <input
                type="text"
                value={editData?.lastName || ''}
                onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-white mb-1">Email</span>
              <input
                type="email"
                value={editData?.email || ''}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-white mb-1">Phone</span>
              <input
                type="text"
                value={editData?.phone || ''}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm"
              />
            </label>

            {/* Company Information */}
            <div className="md:col-span-2 pt-4 mt-4 border-t border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-4">Company Information</h3>
            </div>
            <label className="block md:col-span-2">
              <span className="block text-sm font-medium text-white mb-1">Company Name</span>
              <input
                type="text"
                value={editData?.companyName || ''}
                onChange={(e) => setEditData({ ...editData, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="block text-sm font-medium text-white mb-1">Bio</span>
              <textarea
                value={editData?.bio || ''}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm"
                rows={3}
              />
            </label>

            {/* Location */}
            <div className="md:col-span-2 pt-4 mt-4 border-t border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-4">Location</h3>
            </div>
            <label className="block md:col-span-2">
              <span className="block text-sm font-medium text-white mb-1">Address</span>
              <input
                type="text"
                value={editData?.address || ''}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-white mb-1">City</span>
              <input
                type="text"
                value={editData?.city || ''}
                onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-white mb-1">State</span>
              <input
                type="text"
                value={editData?.state || ''}
                onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-white mb-1">Country</span>
              <input
                type="text"
                value={editData?.country || ''}
                onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-white mb-1">Postal Code</span>
              <input
                type="text"
                value={editData?.postalCode || ''}
                onChange={(e) => setEditData({ ...editData, postalCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm"
              />
            </label>

          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-600">
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-200 text-white rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* View Mode */
        <>
          {/* Personal Information */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
            <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {application.firstName && (
                <div>
                  <p className="text-sm text-gray-400 font-medium">First Name</p>
                  <p className="text-white mt-1">{application.firstName}</p>
                </div>
              )}
              {application.lastName && (
                <div>
                  <p className="text-sm text-gray-400 font-medium">Last Name</p>
                  <p className="text-white mt-1">{application.lastName}</p>
                </div>
              )}
              {application.email && (
                <div>
                  <p className="text-sm text-gray-400 font-medium">Email</p>
                  <p className="text-white mt-1">{application.email}</p>
                </div>
              )}
              {application.phone && (
                <div>
                  <p className="text-sm text-gray-400 font-medium">Phone</p>
                  <p className="text-white mt-1">{application.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
            <h2 className="text-xl font-bold text-white mb-6">Company Information</h2>
            <div className="space-y-6">
              {application.companyName && (
                <div>
                  <p className="text-sm text-gray-400 font-medium">Company Name</p>
                  <p className="text-white mt-1">{application.companyName}</p>
                </div>
              )}
              {application.bio && (
                <div>
                  <p className="text-sm text-gray-400 font-medium">Bio</p>
                  <p className="text-white mt-1 whitespace-pre-wrap">{application.bio}</p>
                </div>
              )}
              {application.serviceCategories && application.serviceCategories.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 font-medium mb-2">Services</p>
                  <div className="flex flex-wrap gap-2">
                    {application.serviceCategories.map(service => (
                      <span key={service} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
            <h2 className="text-xl font-bold text-white mb-6">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {application.address && (
                <div>
                  <p className="text-sm text-gray-400 font-medium">Address</p>
                  <p className="text-white mt-1">{application.address}</p>
                </div>
              )}
              {application.city && (
                <div>
                  <p className="text-sm text-gray-400 font-medium">City</p>
                  <p className="text-white mt-1">{application.city}</p>
                </div>
              )}
              {application.state && (
                <div>
                  <p className="text-sm text-gray-400 font-medium">State</p>
                  <p className="text-white mt-1">{application.state}</p>
                </div>
              )}
              {application.country && (
                <div>
                  <p className="text-sm text-gray-400 font-medium">Country</p>
                  <p className="text-white mt-1">{application.country}</p>
                </div>
              )}
              {application.postalCode && (
                <div>
                  <p className="text-sm text-gray-400 font-medium">Postal Code</p>
                  <p className="text-white mt-1">{application.postalCode}</p>
                </div>
              )}
            </div>
          </div>


          {/* Rejection Reason */}
          {application.status === 'REJECTED' && application.rejectionReason && (
            <div className="bg-red-900/20 rounded-xl border border-red-800 p-8">
              <h2 className="text-xl font-bold text-white mb-4">Rejection Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 font-medium">Rejected on</p>
                  <p className="text-white mt-1">
                    {application.reviewedAt ? new Date(application.reviewedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium">Reason</p>
                  <p className="text-white mt-1 whitespace-pre-wrap">{application.rejectionReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment & Stripe Connect Status */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-8">
            <h2 className="text-xl font-bold text-white mb-6">Payment Setup Status</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 font-medium">Stripe Connect Onboarding</p>
                <div className="mt-2 flex items-center gap-3">
                  {application.user.stripeOnboardingComplete ? (
                    <>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <p className="text-white font-medium">Completed</p>
                      {application.user.stripeConnectAccountId && (
                        <p className="text-xs text-gray-400 ml-2">
                          Account ID: <code className="bg-gray-800 px-2 py-1 rounded">{application.user.stripeConnectAccountId}</code>
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <p className="text-white font-medium">Pending</p>
                    </>
                  )}
                </div>
              </div>
              {application.user.stripeOnboardingComplete && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-300">
                    ✓ Contractor can receive payments via Stripe Connect
                  </p>
                </div>
              )}
              {!application.user.stripeOnboardingComplete && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-300">
                    ⚠ Contractor must complete payment setup before accessing projects and tickets
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submission Details */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
            <h2 className="text-xl font-bold text-white mb-6">Submission Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 font-medium">Submitted</p>
                <p className="text-white mt-1">
                  {new Date(application.submittedAt).toLocaleDateString()}
                </p>
              </div>
              {application.reviewedAt && (
                <div>
                  <p className="text-sm text-gray-400 font-medium">Reviewed</p>
                  <p className="text-white mt-1">
                    {new Date(application.reviewedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
