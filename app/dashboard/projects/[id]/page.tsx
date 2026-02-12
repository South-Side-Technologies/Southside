'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import CommentsSection from '@/app/components/CommentsSection'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  progress: number
  startDate: string
  estimatedCompletion: string | null
  user: {
    id: string
    name: string | null
    email: string
    companyName: string | null
  }
  createdAt: string
  updatedAt: string
}

export default function ProjectDetail() {
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/dashboard/projects/${projectId}`)
        if (!response.ok) throw new Error('Failed to fetch project')
        const data = await response.json()
        setProject(data.project)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planning':
        return 'bg-blue-100 text-blue-700'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700'
      case 'review':
        return 'bg-purple-100 text-purple-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (loading) return <div className="text-center py-8">Loading project...</div>
  if (error) return <div className="text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>
  if (!project) return <div className="text-center py-8">Project not found</div>

  return (
    <>
      <Link href="/dashboard/projects" className="text-red-700 hover:text-red-900 mb-4 inline-block">
        ← Back to Projects
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Project Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
                <p className="text-gray-600 text-sm mt-1">Started {formatDate(project.startDate)}</p>
              </div>
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                {formatStatus(project.status)}
              </span>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-bold text-red-700">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-700 h-3 rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Description */}
            {project.description && (
              <div className="mt-4 text-gray-700 whitespace-pre-wrap">{project.description}</div>
            )}
          </div>

          {/* Comments Section */}
          <div className="mt-6">
            <CommentsSection projectId={projectId} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Project Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium text-gray-900">{formatStatus(project.status)}</p>
              </div>
              <div>
                <p className="text-gray-600">Progress</p>
                <p className="font-medium text-gray-900">{project.progress}%</p>
              </div>
              <div>
                <p className="text-gray-600">Start Date</p>
                <p className="font-medium text-gray-900">{formatDate(project.startDate)}</p>
              </div>
              {project.estimatedCompletion && (
                <div>
                  <p className="text-gray-600">Est. Completion</p>
                  <p className="font-medium text-gray-900">{formatDate(project.estimatedCompletion)}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-medium text-gray-900">{formatDate(project.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">Last Updated</p>
                <p className="font-medium text-gray-900">{formatDate(project.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Team Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600">Contact Name</p>
                <p className="font-medium text-gray-900">{project.user.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Company</p>
                <p className="font-medium text-gray-900">{project.user.companyName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Email</p>
                <p className="font-medium text-gray-900 break-all">{project.user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
