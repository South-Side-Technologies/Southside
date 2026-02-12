import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth/get-current-user'
import prisma from '../../../../lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify contractor is assigned to this project
    const assignment = await prisma.projectAssignment.findFirst({
      where: {
        userId: currentUser.id,
        projectId: params.id,
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
          },
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({
      project: {
        ...project,
        startDate: project.startDate.toISOString(),
        estimatedCompletion: project.estimatedCompletion?.toISOString() || null,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        lastUpdated: project.lastUpdated.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify contractor is assigned to this project
    const assignment = await prisma.projectAssignment.findFirst({
      where: {
        userId: currentUser.id,
        projectId: params.id,
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const body = await request.json()

    // Only allow specific fields to be updated
    const allowedFields = ['status', 'progress', 'description', 'estimatedCompletion']
    const updateData: any = {}

    for (const field of allowedFields) {
      if (field in body) {
        if (field === 'estimatedCompletion' && body[field]) {
          updateData[field] = new Date(body[field])
        } else if (field === 'progress') {
          const progress = parseInt(body[field], 10)
          if (progress < 0 || progress > 100) {
            return NextResponse.json(
              { error: 'Progress must be between 0 and 100' },
              { status: 400 }
            )
          }
          updateData[field] = progress
        } else if (field === 'status') {
          const validStatuses = ['PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']
          if (!validStatuses.includes(body[field])) {
            return NextResponse.json(
              { error: 'Invalid status' },
              { status: 400 }
            )
          }
          updateData[field] = body[field]
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
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
    })

    return NextResponse.json({
      project: {
        ...project,
        startDate: project.startDate.toISOString(),
        estimatedCompletion: project.estimatedCompletion?.toISOString() || null,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        lastUpdated: project.lastUpdated.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}
