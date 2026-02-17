'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import CommentsSection from '@/app/components/CommentsSection'

interface Project {
  id: string
  name: string
  description: string | null
  status: 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED'
  progress: number
  startDate: string
  estimatedCompletion: string | null
  user: {
    name: string | null
    email: string
    companyName: string | null
  }
  assignments: Array<{
    user: {
      id: string
      name: string | null
      email: string
    }
  }>
}

export default function ProjectDetail() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    status: '',
    progress: 0,
    description: '',
    estimatedCompletion: '',
  })

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/contractor/projects/${projectId}`)
        if (!response.ok) throw new Error('Failed to fetch project')
        const data = await response.json()
        setProject(data.project)
        setFormData({
          status: data.project.status,
          progress: data.project.progress,
          description: data.project.description || '',
          estimatedCompletion: data.project.estimatedCompletion?.split('T')[0] || '',
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch(`/api/contractor/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error('Failed to update project')
      const data = await response.json()
      setProject(data.project)
      alert('Project updated successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-8">Loading project...</div>
  if (error) return <div className="text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>
  if (!project) return <div className="text-center py-8">Project not found</div>

  return (
    <>
      <Link href="/contractor/projects" className="text-red-700 hover:text-red-900 mb-4 inline-block">
        ← Back to Projects
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h2>
              <p className="text-gray-400">Customer: {project.user.companyName || project.user.name}</p>
            </div>

            {/* Status and Progress */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700"
                >
                  <option value="PLANNING">Planning</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700"
                />
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-700 h-2 rounded-full transition"
                    style={{ width: `${formData.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={project.startDate.split('T')[0]}
                  disabled
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-400"
                />
              </div>

              <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Est. Completion</label>
                <input
                  type="date"
                  value={formData.estimatedCompletion}
                  onChange={(e) => setFormData({ ...formData, estimatedCompletion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-red-700 text-white py-2 rounded-lg font-medium hover:bg-red-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Members */}
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Assigned Team</h3>
            <div className="space-y-3">
              {project.assignments.length > 0 ? (
                project.assignments.map((assignment) => (
                  <div key={assignment.user.id} className="p-3 bg-gray-800 rounded-lg">
                    <p className="font-medium text-gray-900 text-sm">{assignment.user.name}</p>
                    <p className="text-gray-400 text-xs">{assignment.user.email}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No team members assigned</p>
              )}
            </div>
          </div>

          {/* Project Info */}
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Project Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400">Customer Email</p>
                <p className="font-medium text-gray-900">{project.user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-6">
        <CommentsSection projectId={projectId} />
      </div>
    </>
  )
}
