'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Activity {
  type: 'comment' | 'project_created' | 'ticket_created' | 'project_status_change' | 'ticket_status_change'
  id: string
  createdAt: string
  user?: {
    name: string | null
    email: string
    image: string | null
  }
  content?: string
  project?: {
    id: string
    name: string
  }
  ticket?: {
    id: string
    subject: string
  }
  name?: string
  subject?: string
  status?: string
  oldValue?: string
  newValue?: string
}

function formatTimeAgo(date: string): string {
  const now = new Date()
  const createdAt = new Date(date)
  const diffMs = now.getTime() - createdAt.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch('/api/dashboard/recent-activity')
        if (!response.ok) throw new Error('Failed to fetch activity')
        const data = await response.json()
        setActivities(data.slice(0, 10)) // Show last 10 activities
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch activity')
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [])

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <p className="text-gray-400 text-center py-4">Loading activity...</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>

      {error ? (
        <p className="text-red-600">{error}</p>
      ) : activities.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No recent activity</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={`${activity.type}-${activity.id}`} className="border-l-4 border-red-700 pl-4 py-2 cursor-pointer hover:bg-gray-800 -mx-4 px-4 transition-colors">
              {activity.type === 'comment' && (
                <Link
                  href={activity.project?.id ? `/dashboard/projects/${activity.project.id}` : activity.ticket?.id ? `/dashboard/support/${activity.ticket.id}` : '#'}
                  className="block no-underline"
                >
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user?.name || activity.user?.email}</span>{' '}
                    commented on{' '}
                    {activity.project ? (
                      <span className="text-red-700 hover:underline">{activity.project.name}</span>
                    ) : (
                      <span className="text-red-700 hover:underline">{activity.ticket?.subject}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activity.createdAt)}</p>
                </Link>
              )}

              {activity.type === 'project_created' && activity.project?.id && (
                <Link href={`/dashboard/projects/${activity.project.id}`} className="block no-underline">
                  <p className="text-sm text-gray-900">
                    Project <span className="text-red-700 hover:underline font-medium">{activity.name}</span> was created
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activity.createdAt)}</p>
                </Link>
              )}

              {activity.type === 'ticket_created' && activity.ticket?.id && (
                <Link href={`/dashboard/support/${activity.ticket.id}`} className="block no-underline">
                  <p className="text-sm text-gray-900">
                    Support ticket <span className="text-red-700 hover:underline font-medium">{activity.subject}</span> was created
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activity.createdAt)}</p>
                </Link>
              )}

              {activity.type === 'project_status_change' && activity.project?.id && (
                <Link href={`/dashboard/projects/${activity.project.id}`} className="block no-underline">
                  <p className="text-sm text-gray-900">
                    Project <span className="text-red-700 hover:underline font-medium">{activity.project.name}</span> status changed from{' '}
                    <span className="font-medium">{activity.oldValue}</span> to <span className="font-medium">{activity.newValue}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activity.createdAt)}</p>
                </Link>
              )}

              {activity.type === 'ticket_status_change' && activity.ticket?.id && (
                <Link href={`/dashboard/support/${activity.ticket.id}`} className="block no-underline">
                  <p className="text-sm text-gray-900">
                    Support ticket <span className="text-red-700 hover:underline font-medium">{activity.ticket.subject}</span> status changed from{' '}
                    <span className="font-medium">{activity.oldValue}</span> to <span className="font-medium">{activity.newValue}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activity.createdAt)}</p>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
