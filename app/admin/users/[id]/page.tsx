'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'CONTRACTOR' | 'CLIENT'
  roles: string[]
}

interface Folder {
  id: string
  name: string
}

interface Document {
  id: string
  name: string
  type: string
  size: number
  category: string
  uploadedAt: string
  downloadUrl: string
  folderId: string | null
}

const roleColors = {
  ADMIN: { badge: 'bg-red-100', text: 'text-red-700', label: 'Administrator' },
  CONTRACTOR: { badge: 'bg-blue-100', text: 'text-blue-700', label: 'Contractor' },
  CLIENT: { badge: 'bg-green-100', text: 'text-green-700', label: 'Client' },
}

const roleDescriptions = {
  ADMIN: 'Full access to admin panel, user management, and all system features',
  CONTRACTOR: 'Can manage assigned projects and tickets',
  CLIENT: 'Can view assigned projects and support tickets',
}

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchUser()
  }, [params.id])

  useEffect(() => {
    if (user?.id) {
      fetchDocuments()
    }
  }, [user?.id])

  const fetchUser = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/users/${params.id}/role`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('User not found')
        } else {
          throw new Error('Failed to fetch user')
        }
        return
      }

      const data = await response.json()
      setUser(data.user)
      setSelectedRoles(data.user.roles || [data.user.role])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user details')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDocuments = async () => {
    try {
      setIsLoadingDocuments(true)
      const response = await fetch(`/api/admin/users/${params.id}/documents`)

      if (!response.ok) {
        if (response.status !== 404) {
          throw new Error('Failed to fetch documents')
        }
        setDocuments([])
        setFolders([])
        return
      }

      const data = await response.json()
      setDocuments(data.documents || [])
      setFolders(data.folders || [])
    } catch (err) {
      console.error('Error fetching documents:', err)
      setDocuments([])
      setFolders([])
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  const handleRoleUpdate = async () => {
    if (!user || JSON.stringify(selectedRoles.sort()) === JSON.stringify((user.roles || [user.role]).sort())) return

    if (selectedRoles.length === 0) {
      setError('User must have at least one role')
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(`/api/admin/users/${params.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: selectedRoles }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update roles')
      }

      const data = await response.json()
      setUser(data.user)
      setSelectedRoles(data.user.roles || [data.user.role])
      setSuccessMessage('Roles updated successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update roles')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImpersonate = async () => {
    if (!user) return
    if (!confirm(`Impersonate ${user.email}?\n\nYou will be switched to this user's account.`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: params.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to impersonate user')
      }

      window.location.href = '/dashboard'
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to impersonate user')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-700 border-r-transparent mb-4"></div>
          <p className="text-gray-400">Loading user details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center max-w-md mx-auto">
        <p className="text-red-300 font-semibold mb-2">Error Loading User</p>
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchUser}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb and Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link href="/admin" className="hover:text-red-700">
            Admin
          </Link>
          <span>/</span>
          <Link href="/admin/users" className="hover:text-red-700">
            Users
          </Link>
          <span>/</span>
          <span className="text-white">{user.name || user.email}</span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-playfair">User Details</h1>
          <button
            onClick={() => router.push('/admin/users')}
            className="text-gray-400 hover:text-white text-sm"
          >
            ← Back to Users
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-800">
          {successMessage}
        </div>
      )}

      {/* User Information Card */}
      <div className="bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-700 mb-6">
        <h2 className="text-lg font-semibold text-white mb-6">User Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Name</p>
            <p className="text-lg font-medium text-white">{user.name || 'Not set'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Email</p>
            <p className="text-lg font-medium text-white">{user.email}</p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-gray-400 mb-1">Current Roles</p>
            <div className="flex flex-wrap items-center gap-2">
              {(user.roles && user.roles.length > 0 ? user.roles : [user.role]).map((role) => (
                <span
                  key={role}
                  className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                    roleColors[role as keyof typeof roleColors]?.badge || 'bg-gray-800'
                  } ${roleColors[role as keyof typeof roleColors]?.text || 'text-gray-300'}`}
                >
                  {roleColors[role as keyof typeof roleColors]?.label || role}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">User ID</p>
            <p className="text-sm font-mono text-gray-400">{user.id}</p>
          </div>
        </div>
      </div>

      {/* Role Management Card */}
      <div className="bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-700 mb-6">
        <h2 className="text-lg font-semibold text-white mb-6">Account Type & Permissions</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-4">Assign Roles</label>
            <div className="space-y-3">
              {['ADMIN', 'CONTRACTOR', 'CLIENT'].map((role) => (
                <label key={role} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRoles([...selectedRoles, role])
                      } else {
                        setSelectedRoles(selectedRoles.filter((r) => r !== role))
                      }
                    }}
                    className="w-5 h-5 rounded border-gray-600 text-red-700 focus:ring-red-700 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-white">{roleColors[role as keyof typeof roleColors].label}</div>
                    <div className="text-sm text-gray-400">{roleDescriptions[role as keyof typeof roleDescriptions]}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {JSON.stringify(selectedRoles.sort()) !== JSON.stringify((user.roles || [user.role]).sort()) && (
            <button
              onClick={handleRoleUpdate}
              disabled={isSaving || selectedRoles.length === 0}
              className="bg-red-700 hover:bg-red-800 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Roles'}
            </button>
          )}
        </div>
      </div>

      {/* Actions Card */}
      <div className="bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-700 mb-6">
        <h2 className="text-lg font-semibold text-white mb-6">Actions</h2>

        <button
          onClick={handleImpersonate}
          className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Impersonate User
        </button>
        <p className="text-sm text-gray-400 mt-3">
          Impersonating will switch your session to act as this user. You can stop impersonating from the dashboard.
        </p>
      </div>

      {/* Documents Card */}
      <div className="bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-6">Uploaded Documents</h2>

        {isLoadingDocuments ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-red-700 border-r-transparent mb-2"></div>
              <p className="text-sm text-gray-400">Loading documents...</p>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {folders.map((folder) => {
              const folderDocs = documents.filter((doc) => doc.folderId === folder.id)
              return (
                <div key={folder.id}>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3a2 2 0 012-2h6a2 2 0 012 2v2h7a2 2 0 012 2v13a2 2 0 01-2 2H5a2 2 0 01-2-2V3z" />
                    </svg>
                    {folder.name}
                  </h3>

                  {folderDocs.length === 0 ? (
                    <p className="text-sm text-gray-400 ml-7 mb-4">No documents in this folder</p>
                  ) : (
                    <div className="ml-7 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-800 border-b border-gray-700">
                          <tr>
                            <th className="text-left py-3 px-4 font-semibold text-gray-300">File Name</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-300">Category</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-300">Size</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-300">Uploaded</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-300">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {folderDocs.map((doc) => (
                            <tr key={doc.id} className="border-b border-gray-700 last:border-0 hover:bg-gray-800">
                              <td className="py-3 px-4 text-white font-medium">
                                <div className="flex items-center gap-2">
                                  <svg
                                    className="w-4 h-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                  </svg>
                                  {doc.name}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-400">
                                <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-800 text-gray-300 rounded">
                                  {doc.category.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-400">
                                {(doc.size / 1024 / 1024).toFixed(2)} MB
                              </td>
                              <td className="py-3 px-4 text-gray-400">{doc.uploadedAt}</td>
                              <td className="py-3 px-4">
                                <a
                                  href={doc.downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-red-400 hover:text-red-700 font-semibold"
                                >
                                  Download →
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
