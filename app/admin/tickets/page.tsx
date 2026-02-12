'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  description: string | null
  status: string
  priority: string
  user: {
    id: string
    email: string
    name: string | null
    companyName: string | null
  }
  createdAt: string
  _count?: {
    comments: number
  }
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')

  useEffect(() => {
    fetchTickets()
  }, [selectedStatus, selectedPriority])

  const fetchTickets = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (selectedStatus !== 'all') params.append('status', selectedStatus)
      if (selectedPriority !== 'all') params.append('priority', selectedPriority)

      const url = `/api/admin/tickets?${params.toString()}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch tickets')
      }

      const data = await response.json()
      setTickets(data.tickets || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignToContractor = async (ticketId: string) => {
    // TODO: Implement contractor assignment dialog
    alert('Contractor assignment feature coming soon')
  }

  const handleDelete = async (ticketId: string, ticketNumber: string) => {
    if (!confirm(`Delete ticket #${ticketNumber}?\n\nThis action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete ticket')
      }

      fetchTickets()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete ticket')
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-red-100 text-red-700'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700'
      case 'resolved':
        return 'bg-green-100 text-green-700'
      case 'closed':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low':
        return 'bg-blue-100 text-blue-700'
      case 'medium':
        return 'bg-orange-100 text-orange-700'
      case 'high':
        return 'bg-red-100 text-red-700'
      case 'urgent':
        return 'bg-red-200 text-red-900'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-700 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">Error Loading Tickets</p>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchTickets}
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
          Support Tickets
        </h1>
        <p className="text-gray-600 text-lg">
          Manage and track all customer support tickets
        </p>
      </div>

      {/* Status and Priority Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Status</label>
            <div className="flex gap-2 flex-wrap">
              {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    selectedStatus === status
                      ? 'bg-red-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {formatStatus(status)}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Priority</label>
            <div className="flex gap-2 flex-wrap">
              {['all', 'low', 'medium', 'high', 'urgent'].map((priority) => (
                <button
                  key={priority}
                  onClick={() => setSelectedPriority(priority)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    selectedPriority === priority
                      ? 'bg-red-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {formatStatus(priority)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <strong>{tickets.length}</strong> {tickets.length === 1 ? 'ticket' : 'tickets'}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Ticket #</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Subject</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Priority</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No tickets found{selectedStatus !== 'all' || selectedPriority !== 'all' ? ' with selected filters' : ''}.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => window.location.href = `/admin/tickets/${ticket.id}`}
                  >
                    <td className="py-4 px-6">
                      <div className="font-semibold text-red-700">#{ticket.ticketNumber}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900 max-w-xs truncate">
                        {ticket.subject}
                      </div>
                      {ticket.description && (
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                          {ticket.description.split('\n')[0]}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">
                        {ticket.user.companyName || ticket.user.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">{ticket.user.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(ticket.status)}`}>
                        {formatStatus(ticket.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(ticket.priority)}`}>
                        {formatStatus(ticket.priority)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {formatDate(ticket.createdAt)}
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
