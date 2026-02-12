'use client'

import React from 'react'

export interface SupportTicket {
  id: string
  subject: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  updatedAt: string
}

interface SupportTicketListProps {
  tickets: SupportTicket[]
}

const statusColors = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
}

const statusLabels = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

const priorityColors = {
  low: 'text-gray-600',
  medium: 'text-blue-600',
  high: 'text-orange-600',
  urgent: 'text-red-600',
}

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export default function SupportTicketList({ tickets }: SupportTicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500 text-lg">No support tickets yet</p>
        <p className="text-gray-400 text-sm mt-2">Create a ticket if you need assistance</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => window.location.href = `/dashboard/support/${ticket.id}`}
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-mono text-gray-500">#{ticket.id}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    statusColors[ticket.status]
                  }`}
                >
                  {statusLabels[ticket.status]}
                </span>
              </div>
              <h3 className="text-lg font-bold text-black">{ticket.subject}</h3>
            </div>
            <div className={`text-sm font-semibold ${priorityColors[ticket.priority]}`}>
              {priorityLabels[ticket.priority]}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div>
              <span className="font-medium">Created:</span> {ticket.createdAt}
            </div>
            <div>
              <span className="font-medium">Updated:</span> {ticket.updatedAt}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
