import React from 'react'
import ProjectCard, { type Project } from '../../components/dashboard/ProjectCard'
import { getCurrentUser } from '../../lib/auth/get-current-user'
import { prisma } from '../../lib/db/prisma'

// Helper functions for data transformation
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  }
  const months = Math.floor(diffDays / 30)
  return `${months} ${months === 1 ? 'month' : 'months'} ago`
}

export default async function ProjectsPage() {
  const currentUser = await getCurrentUser()

  let projects: Project[] = []
  let error: string | null = null

  try {
    if (!currentUser) {
      error = 'Not authenticated'
    } else {
      const dbProjects = await prisma.project.findMany({
        where: { userId: currentUser.id },
        orderBy: { updatedAt: 'desc' },
      })

      projects = dbProjects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description ?? undefined,
        status: p.status.toLowerCase() as Project['status'],
        progress: p.progress,
        startDate: formatDate(p.startDate),
        estimatedCompletion: p.estimatedCompletion ? formatDate(p.estimatedCompletion) : undefined,
        lastUpdated: getRelativeTime(p.updatedAt),
        assignedTeam: p.assignedTeam.length > 0 ? p.assignedTeam : undefined,
      }))
    }
  } catch (err) {
    console.error('Error fetching projects:', err)
    error = 'Failed to load projects'
  }

  // Filter projects by status
  const activeProjects = projects.filter((p) => p.status !== 'completed')
  const completedProjects = projects.filter((p) => p.status === 'completed')

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-2 font-playfair">
          Projects
        </h1>
        <p className="text-gray-600 text-lg">
          Track the progress of your ongoing and completed projects.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Empty State */}
      {projects.length === 0 && !error && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-black mb-2 font-playfair">
            No Projects Yet
          </h2>
          <p className="text-gray-600">
            Your projects will appear here once we begin working together.
          </p>
        </div>
      )}

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-black mb-4 font-playfair">
            Active Projects ({activeProjects.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-black mb-4 font-playfair">
            Completed Projects ({completedProjects.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {completedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
