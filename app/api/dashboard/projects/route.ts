import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserByEmail } from '@/app/lib/db/user'
import { prisma } from '@/app/lib/db/prisma'
import type { Project } from '@/app/components/dashboard/ProjectCard'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Helper to format date as "Mon DD, YYYY"
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Helper to get relative time string
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

/**
 * GET /api/dashboard/projects
 * Returns list of projects for the authenticated user
 * Protected by NextAuth
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from NextAuth session
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get or create user in database
    let dbUser = await getUserByEmail(session.user.email)

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || '',
        },
      })
    }

    // Fetch projects from database
    const dbProjects = await prisma.project.findMany({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: 'desc' },
    })

    // Transform database projects to API format
    const projects: Project[] = dbProjects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? undefined,
      status: p.status.toLowerCase() as Project['status'],
      progress: p.progress,
      startDate: formatDate(p.startDate),
      estimatedCompletion: p.estimatedCompletion ? formatDate(p.estimatedCompletion) : undefined,
      lastUpdated: getRelativeTime(p.updatedAt),
      assignedTeam: p.assignedTeam ?? undefined,
    }))

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}
