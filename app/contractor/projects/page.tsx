'use client'

import { useState, useEffect } from 'react'

interface ProjectWithCustomer {
  id: string
  name: string
  description: string | null
  status: 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED'
  progress: number
  startDate: string
  estimatedCompletion: string | null
  lastUpdated: string
  user: {
    name: string | null
    companyName: string | null
  }
}

type StatusFilter = 'ALL' | 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED'

export default function ContractorProjects() {
  const [projects, setProjects] = useState<ProjectWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/contractor/projects')
        if (!response.ok) throw new Error('Failed to fetch projects')
        const data = await response.json()
        setProjects(data.projects)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const filteredProjects = statusFilter === 'ALL'
    ? projects
    : projects.filter(p => p.status === statusFilter)

  const statusCounts = {
    ALL: projects.length,
    PLANNING: projects.filter(p => p.status === 'PLANNING').length,
    IN_PROGRESS: projects.filter(p => p.status === 'IN_PROGRESS').length,
    REVIEW: projects.filter(p => p.status === 'REVIEW').length,
    COMPLETED: projects.filter(p => p.status === 'COMPLETED').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'REVIEW':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600 mt-2">Manage your assigned projects</p>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['ALL', 'PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              statusFilter === status
                ? 'bg-red-700 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status === 'ALL' ? 'All' : status.replace(/_/g, ' ')} ({statusCounts[status]})
          </button>
        ))}
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="px-6 py-8 text-center text-gray-500">Loading projects...</div>
        ) : filteredProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => window.location.href = `/contractor/projects/${project.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {project.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {project.user.companyName || project.user.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-700 h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(project.lastUpdated).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            No projects found with the selected status
          </div>
        )}
      </div>
    </>
  )
}
