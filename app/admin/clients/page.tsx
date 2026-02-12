'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface Client {
  id: string
  email: string
  name: string | null
  role: 'CLIENT'
  questionnaireCompleted: boolean
  createdAt: string
  _count: {
    documents: number
  }
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/users')

      if (!response.ok) {
        throw new Error('Failed to fetch clients')
      }

      const data = await response.json()
      // Filter to only CLIENT role users
      const clientsOnly = data.users.filter((user: Client) => user.role === 'CLIENT')
      setClients(clientsOnly)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredClients = clients.filter(client =>
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-700 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">Error Loading Clients</p>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchClients}
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
          Client Management
        </h1>
        <p className="text-gray-600 text-lg">
          View and manage all registered clients
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
            <strong>{filteredClients.length}</strong> {filteredClients.length === 1 ? 'client' : 'clients'}
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Client</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Documents</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Joined</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    {searchTerm ? 'No clients found matching your search.' : 'No clients yet.'}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">
                        {client.name || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">{client.email}</td>
                    <td className="py-4 px-6">
                      {client.questionnaireCompleted ? (
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
                      {client._count.documents}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <Link
                        href={`/admin/clients/${client.id}`}
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
