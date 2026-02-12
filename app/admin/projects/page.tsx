'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  progress: number
  startDate: string
  estimatedCompletion: string | null
  assignedTeam: string[]
  user: {
    id: string
    email: string
    name: string | null
    companyName: string | null
  }
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    fetchProjects()
  }, [selectedStatus])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const url = selectedStatus === 'all'
        ? '/api/admin/projects'
        : `/api/admin/projects?status=${selectedStatus}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }

      const data = await response.json()
      setProjects(data.projects)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (projectId: string, projectName: string) => {
    if (!confirm(`Delete project "${projectName}"?\n\nThis action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete project')
      }

      // Refresh projects list
      fetchProjects()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project')
    }
  }

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
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-700 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">Error Loading Projects</p>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchProjects}
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
          Project Management
        </h1>
        <p className="text-gray-600 text-lg">
          View and manage all customer projects
        </p>
      </div>

      {/* Status Filter and Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-red-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus('planning')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedStatus === 'planning'
                  ? 'bg-red-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Planning
            </button>
            <button
              onClick={() => setSelectedStatus('in_progress')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedStatus === 'in_progress'
                  ? 'bg-red-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setSelectedStatus('review')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedStatus === 'review'
                  ? 'bg-red-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Review
            </button>
            <button
              onClick={() => setSelectedStatus('completed')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedStatus === 'completed'
                  ? 'bg-red-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
          <div className="text-sm text-gray-600">
            <strong>{projects.length}</strong> {projects.length === 1 ? 'project' : 'projects'}
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Project Name</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Progress</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Team</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No projects found{selectedStatus !== 'all' ? ` in ${formatStatus(selectedStatus)}` : ''}.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => window.location.href = `/admin/projects/${project.id}/edit`}
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">
                        {project.name}
                      </div>
                      {project.description && (
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                          {project.description.split('\n')[0]}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">
                        {project.user.companyName || project.user.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">{project.user.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(project.status)}`}>
                        {formatStatus(project.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-red-700 h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {project.assignedTeam.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {project.assignedTeam.slice(0, 2).map((member, idx) => (
                            <span key={idx} className="inline-block px-2 py-1 text-xs bg-gray-100 rounded">
                              {member}
                            </span>
                          ))}
                          {project.assignedTeam.length > 2 && (
                            <span className="inline-block px-2 py-1 text-xs text-gray-500">
                              +{project.assignedTeam.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No team assigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(project.id, project.name)
                        }}
                        className="text-sm text-red-600 hover:text-red-700 font-semibold"
                      >
                        Delete
                      </button>
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
