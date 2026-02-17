'use client'

import React, { useState, useEffect } from 'react'
import SupportTicketList, { type SupportTicket } from '../../components/dashboard/SupportTicketList'

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [subject, setSubject] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [description, setDescription] = useState('')

  // Fetch tickets on mount
  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/dashboard/support')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim() || !description.trim()) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch('/api/dashboard/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          priority,
          description: description.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create ticket')
      }

      const data = await response.json()

      // Add new ticket to the list
      setTickets([data.ticket, ...tickets])

      // Reset form and close modal
      setSubject('')
      setPriority('medium')
      setDescription('')
      setShowModal(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter tickets by status
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress')
  const closedTickets = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-secondary">Loading tickets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert-error text-center">
        <p className="font-semibold mb-2">Error Loading Tickets</p>
        <p className="mb-4">{error}</p>
        <button
          onClick={fetchTickets}
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
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 font-playfair">
            Support Tickets
          </h1>
          <p className="text-secondary text-lg">
            View and manage your support requests.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary py-3 px-6"
        >
          New Ticket
        </button>
      </div>

      {/* Open/In Progress Tickets */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-primary mb-4 font-playfair">
          Active Tickets ({openTickets.length})
        </h2>
        {openTickets.length > 0 ? (
          <SupportTicketList tickets={openTickets} />
        ) : (
          <div className="card-light p-8 text-center">
            <p className="text-secondary">No active tickets. You're all set!</p>
          </div>
        )}
      </div>

      {/* Resolved/Closed Tickets */}
      {closedTickets.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-primary mb-4 font-playfair">
            Closed Tickets ({closedTickets.length})
          </h2>
          <SupportTicketList tickets={closedTickets} />
        </div>
      )}

      {/* Create Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="border-b border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white font-playfair">
                  Create Support Ticket
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-400 transition-colors"
                  disabled={isSubmitting}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Subject */}
              <div className="mb-6">
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-300 mb-2">
                  Subject <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  placeholder="Brief description of the issue"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Priority */}
              <div className="mb-6">
                <label htmlFor="priority" className="block text-sm font-semibold text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as typeof priority)}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-300 mb-2">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent resize-none"
                  placeholder="Please provide detailed information about your request or issue..."
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-gray-300 font-semibold hover:bg-gray-800 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-700 hover:bg-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
