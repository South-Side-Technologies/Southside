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
          <div className="loading-spinner mb-4"></div>
          <p className="text-secondary">Loading clients...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert-error text-center">
        <p className="font-semibold mb-2">Error Loading Clients</p>
        <p className="mb-4">{error}</p>
        <button
          onClick={fetchClients}
          className="btn-primary py-2 px-4"
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
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 font-playfair">
          Client Management
        </h1>
        <p className="text-secondary text-lg">
          View and manage all registered clients
        </p>
      </div>

      {/* Search and Stats */}
      <div className="card-light mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="text-sm text-secondary">
            <strong>{filteredClients.length}</strong> {filteredClients.length === 1 ? 'client' : 'clients'}
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="card-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="table-header-cell">Client</th>
                <th className="table-header-cell">Email</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Documents</th>
                <th className="table-header-cell">Joined</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center text-muted">
                    {searchTerm ? 'No clients found matching your search.' : 'No clients yet.'}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="table-row">
                    <td className="table-cell">
                      <div className="font-medium text-primary">
                        {client.name || 'N/A'}
                      </div>
                    </td>
                    <td className="table-cell text-primary">{client.email}</td>
                    <td className="table-cell">
                      {client.questionnaireCompleted ? (
                        <span className="badge-success">Active</span>
                      ) : (
                        <span className="badge-warning">Pending Setup</span>
                      )}
                    </td>
                    <td className="table-cell text-secondary">
                      {client._count.documents}
                    </td>
                    <td className="table-cell text-secondary">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="table-cell">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="text-sm text-red-400 hover:text-red-300 font-semibold"
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
