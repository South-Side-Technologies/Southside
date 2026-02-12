'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  progress: number
  startDate: string
  estimatedCompletion: string | null
}

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  status: string
  priority: string
  createdAt: string
}

interface Client {
  id: string
  email: string
  name: string | null
  companyName: string | null
  role: string
  questionnaireCompleted: boolean
  createdAt: string
  projects: Project[]
  supportTickets: Ticket[]
}

export default function ClientDetail() {
  const params = useParams()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/admin/clients/${clientId}`)
        if (!response.ok) throw new Error('Failed to fetch client')
        const data = await response.json()
        setClient(data.client)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load client')
      } finally {
        setLoading(false)
      }
    }

    fetchClient()
  }, [clientId])

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planning':
        return 'bg-blue-100 text-blue-700'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700'
      case 'review':
        return 'bg-purple-100 text-purple-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
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

  if (loading) return <div className="text-center py-8">Loading client...</div>
  if (error) return <div className="text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>
  if (!client) return <div className="text-center py-8">Client not found</div>

  return (
    <>
      <Link href="/admin/clients" className="text-red-700 hover:text-red-900 mb-4 inline-block">
        ← Back to Clients
      </Link>

      {/* Client Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{client.name || 'N/A'}</h1>
            <p className="text-gray-600">{client.email}</p>
            {client.companyName && (
              <p className="text-gray-600 mt-1">Company: {client.companyName}</p>
            )}
          </div>
          <div className="flex gap-2">
            {client.questionnaireCompleted ? (
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                Questionnaire Complete
              </span>
            ) : (
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
                Pending Setup
              </span>
            )}
          </div>
        </div>
        <p className="text-gray-600 text-sm mt-4">Member since {formatDate(client.createdAt)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Projects ({client.projects.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {client.projects.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No projects assigned yet
              </div>
            ) : (
              client.projects.map((project) => (
                <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/admin/projects/${project.id}/edit`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(project.status)}`}>
                      {formatStatus(project.status)}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-700 h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{project.progress}%</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {project.startDate && `Start: ${formatDate(project.startDate)}`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Support Tickets Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Support Tickets ({client.supportTickets.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {client.supportTickets.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No support tickets yet
              </div>
            ) : (
              client.supportTickets.map((ticket) => (
                <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/admin/tickets/${ticket.id}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">#{ticket.ticketNumber}</p>
                      <h3 className="text-sm text-gray-700 mt-1 font-medium">{ticket.subject}</h3>
                    </div>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(ticket.status)}`}>
                      {formatStatus(ticket.status)}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getPriorityBadgeColor(ticket.priority)}`}>
                      {formatStatus(ticket.priority)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(ticket.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
