'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'CONTRACTOR' | 'CLIENT'
  questionnaireCompleted: boolean
  createdAt: string
  _count: {
    documents: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/users')

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }


  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-700 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">Error Loading Users</p>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchUsers}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-2 font-playfair">
          User Management
        </h1>
        <p className="text-gray-600 text-lg">
          View and manage all registered users
        </p>
      </div>

      {/* Search and Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600">
            <strong>{filteredUsers.length}</strong> {filteredUsers.length === 1 ? 'user' : 'users'}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">User</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Role</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Documents</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Joined</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    {searchTerm ? 'No users found matching your search.' : 'No users yet.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">
                        {user.name || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">{user.email}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'ADMIN'
                            ? 'text-red-700 bg-red-100'
                            : user.role === 'CONTRACTOR'
                              ? 'text-blue-700 bg-blue-100'
                              : 'text-green-700 bg-green-100'
                        }`}
                      >
                        {user.role === 'ADMIN' ? 'Administrator' : user.role === 'CONTRACTOR' ? 'Contractor' : 'Client'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {user.questionnaireCompleted ? (
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">
                          Pending Setup
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {user._count.documents}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-sm text-red-600 hover:text-red-700 font-semibold"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
