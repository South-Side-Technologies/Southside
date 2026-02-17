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
        return 'bg-gray-800 text-gray-300'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-muted">Loading projects...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert-error text-center">
        <p className="font-semibold mb-2">Error Loading Projects</p>
        <p className="mb-4">{error}</p>
        <button
          onClick={fetchProjects}
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
          Project Management
        </h1>
        <p className="text-secondary text-lg">
          View and manage all customer projects
        </p>
      </div>

      {/* Status Filter and Stats */}
      <div className="stat-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2 flex-wrap">
            {['all', 'planning', 'in_progress', 'review', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={selectedStatus === status ? 'btn-filter-active' : 'btn-filter-inactive'}
              >
                {formatStatus(status)}
              </button>
            ))}
          </div>
          <div className="text-sm text-muted">
            <strong>{projects.length}</strong> {projects.length === 1 ? 'project' : 'projects'}
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 border-b border-gray-700">
                <th className="table-header-cell">Project Name</th>
                <th className="table-header-cell">Customer</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Progress</th>
                <th className="table-header-cell">Team</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">
                    No projects found{selectedStatus !== 'all' ? ` in ${formatStatus(selectedStatus)}` : ''}.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr
                    key={project.id}
                    className="table-row cursor-pointer"
                    onClick={() => window.location.href = `/admin/projects/${project.id}/edit`}
                  >
                    <td className="table-cell">
                      <div className="font-medium text-primary">
                        {project.name}
                      </div>
                      {project.description && (
                        <div className="text-xs text-muted mt-1 truncate max-w-xs">
                          {project.description.split('\n')[0]}
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="text-sm font-medium text-primary">
                        {project.user.companyName || project.user.name || 'N/A'}
                      </div>
                      <div className="text-xs text-muted">{project.user.email}</div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge-base ${getStatusBadgeColor(project.status)}`}>
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
                        <span className="text-sm text-gray-400">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-400">
                      {project.assignedTeam.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {project.assignedTeam.slice(0, 2).map((member, idx) => (
                            <span key={idx} className="inline-block px-2 py-1 text-xs bg-gray-800 rounded">
                              {member}
                            </span>
                          ))}
                          {project.assignedTeam.length > 2 && (
                            <span className="inline-block px-2 py-1 text-xs text-muted">
                              +{project.assignedTeam.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">No team assigned</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(project.id, project.name)
                        }}
                        className="text-sm text-red-400 hover:text-red-700:text-red-300 font-semibold"
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
