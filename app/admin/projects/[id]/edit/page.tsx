'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

export default function AdminEditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'PLANNING',
    progress: 0,
    startDate: '',
    estimatedCompletion: '',
    assignedTeam: '',
  })

  useEffect(() => {
    fetchProject()
  }, [params.id])

  const fetchProject = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/projects/${params.id}`)

      if (!response.ok) {
        throw new Error('Failed to fetch project')
      }

      const data = await response.json()
      const proj = data.project

      setProject(proj)
      setFormData({
        name: proj.name,
        description: proj.description || '',
        status: proj.status,
        progress: proj.progress,
        startDate: proj.startDate.split('T')[0], // Format for date input
        estimatedCompletion: proj.estimatedCompletion ? proj.estimatedCompletion.split('T')[0] : '',
        assignedTeam: proj.assignedTeam.join(', '),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      // Parse assignedTeam from comma-separated string to array
      const teamArray = formData.assignedTeam
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)

      const response = await fetch(`/api/admin/projects/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          status: formData.status,
          progress: formData.progress,
          startDate: formData.startDate,
          estimatedCompletion: formData.estimatedCompletion || null,
          assignedTeam: teamArray,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update project')
      }

      // Redirect back to projects list
      router.push('/admin/projects')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/projects')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-700 border-r-transparent mb-4"></div>
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error && !project) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
        <p className="text-red-300 font-semibold mb-2">Error Loading Project</p>
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={handleCancel}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Back to Projects
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 font-playfair">
          Edit Project
        </h1>
        <p className="text-gray-400 text-lg">
          {project?.user.companyName || project?.user.name || project?.user.email}
        </p>
      </div>

      {/* Form */}
      <div className="bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-700">
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
              placeholder="Project description..."
            />
          </div>

          {/* Status and Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
              >
                <option value="PLANNING">Planning</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Progress (0-100) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                required
                className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Estimated Completion
              </label>
              <input
                type="date"
                value={formData.estimatedCompletion}
                onChange={(e) => setFormData({ ...formData, estimatedCompletion: e.target.value })}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
              />
            </div>
          </div>

          {/* Assigned Team */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Assigned Team
            </label>
            <input
              type="text"
              value={formData.assignedTeam}
              onChange={(e) => setFormData({ ...formData, assignedTeam: e.target.value })}
              placeholder="Enter names separated by commas (e.g., John Doe, Jane Smith)"
              className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">
              Separate multiple team members with commas
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-800 text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
