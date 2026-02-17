'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import CommentsSection from '@/app/components/CommentsSection'

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
  updatedAt: string
}

export default function TicketDetail() {
  const params = useParams()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/contractor/tickets/${ticketId}`)
        if (!response.ok) throw new Error('Failed to fetch ticket')
        const data = await response.json()
        setTicket(data.ticket)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ticket')
      } finally {
        setLoading(false)
      }
    }

    fetchTicket()
  }, [ticketId])

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-red-100 text-red-700'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700'
      case 'resolved':
        return 'bg-green-100 text-green-700'
      case 'closed':
        return 'bg-gray-800 text-gray-300'
      default:
        return 'bg-gray-800 text-gray-300'
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
        return 'bg-gray-800 text-gray-300'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (loading) return <div className="text-center py-8">Loading ticket...</div>
  if (error) return <div className="text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>
  if (!ticket) return <div className="text-center py-8">Ticket not found</div>

  return (
    <>
      <Link href="/contractor/tickets" className="text-red-700 hover:text-red-900 mb-4 inline-block">
        ← Back to Tickets
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Ticket Header */}
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">#{ticket.ticketNumber}</h2>
                <p className="text-gray-400 text-sm mt-1">{formatDate(ticket.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(ticket.status)}`}>
                  {formatStatus(ticket.status)}
                </span>
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(ticket.priority)}`}>
                  {formatStatus(ticket.priority)}
                </span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{ticket.subject}</h3>
            {ticket.description && (
              <p className="text-gray-300 whitespace-pre-wrap">{ticket.description}</p>
            )}
          </div>

          {/* Comments Section */}
          <div className="mt-6">
            <CommentsSection supportTicketId={ticketId} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">Name</p>
                <p className="font-medium text-gray-900">{ticket.user.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Company</p>
                <p className="font-medium text-gray-900">{ticket.user.companyName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="font-medium text-gray-900">{ticket.user.email}</p>
              </div>
            </div>
          </div>

          {/* Ticket Info */}
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Ticket Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400">Status</p>
                <p className="font-medium text-gray-900">{formatStatus(ticket.status)}</p>
              </div>
              <div>
                <p className="text-gray-400">Priority</p>
                <p className="font-medium text-gray-900">{formatStatus(ticket.priority)}</p>
              </div>
              <div>
                <p className="text-gray-400">Created</p>
                <p className="font-medium text-gray-900">{formatDate(ticket.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-400">Last Updated</p>
                <p className="font-medium text-gray-900">{formatDate(ticket.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
