import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../lib/auth/get-current-user'
import prisma from '../../../lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')

    const projects = await prisma.projectAssignment.findMany({
      where: {
        userId: currentUser.id,
        ...(statusFilter && { project: { status: statusFilter as any } }),
      },
      include: {
        project: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    })

    return NextResponse.json({
      projects: projects.map(assignment => ({
        id: assignment.project.id,
        name: assignment.project.name,
        description: assignment.project.description,
        status: assignment.project.status,
        progress: assignment.project.progress,
        startDate: assignment.project.startDate.toISOString(),
        estimatedCompletion: assignment.project.estimatedCompletion?.toISOString() || null,
        lastUpdated: assignment.project.lastUpdated.toISOString(),
        user: assignment.project.user,
      })),
    })
  } catch (error) {
    console.error('Error fetching contractor projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}
