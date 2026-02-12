'use client'

import { useState, useEffect } from 'react'

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  description: string | null
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  createdAt: string
  user: {
    name: string | null
    email: string
    companyName: string | null
  }
}

type StatusFilter = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

export default function ContractorTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/contractor/tickets')
        if (!response.ok) throw new Error('Failed to fetch tickets')
        const data = await response.json()
        setTickets(data.tickets)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tickets')
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  const filteredTickets = statusFilter === 'ALL'
    ? tickets
    : tickets.filter(t => t.status === statusFilter)

  const statusCounts = {
    ALL: tickets.length,
    OPEN: tickets.filter(t => t.status === 'OPEN').length,
    IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    RESOLVED: tickets.filter(t => t.status === 'RESOLVED').length,
    CLOSED: tickets.filter(t => t.status === 'CLOSED').length,
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLOSED':
        return 'bg-green-100 text-green-800'
      case 'RESOLVED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-gray-600 mt-2">View and update your assigned tickets</p>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              statusFilter === status
                ? 'bg-red-700 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status === 'ALL' ? 'All' : status.replace(/_/g, ' ')} ({statusCounts[status]})
          </button>
        ))}
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="px-6 py-8 text-center text-gray-500">Loading tickets...</div>
        ) : filteredTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => window.location.href = `/contractor/tickets/${ticket.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-700">
                      {ticket.ticketNumber}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {ticket.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {ticket.user.companyName || ticket.user.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            No tickets found with the selected status
          </div>
        )}
      </div>
    </>
  )
}
