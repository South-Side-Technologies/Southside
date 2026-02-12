import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/app/lib/db/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/projects/[id]
 * Get single project details (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // TODO: Add admin role check here

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            companyName: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/projects/[id]
 * Update project fields (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // TODO: Add admin role check here

    const body = await request.json()
    const {
      name,
      description,
      status,
      progress,
      startDate,
      estimatedCompletion,
      assignedTeam,
    } = body

    // Validate status if provided
    if (status) {
      const validStatuses = ['PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']
      if (!validStatuses.includes(status.toUpperCase())) {
        return NextResponse.json(
          { error: 'Invalid status value' },
          { status: 400 }
        )
      }
    }

    // Validate progress if provided
    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return NextResponse.json(
        { error: 'Progress must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Get current project to check if status is changing
    const currentProject = await prisma.project.findUnique({
      where: { id: params.id },
    })

    if (!currentProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Build update data (only include provided fields)
    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status.toUpperCase()
    if (progress !== undefined) updateData.progress = progress
    if (startDate !== undefined) updateData.startDate = new Date(startDate)
    if (estimatedCompletion !== undefined) {
      updateData.estimatedCompletion = estimatedCompletion ? new Date(estimatedCompletion) : null
    }
    if (assignedTeam !== undefined) updateData.assignedTeam = assignedTeam

    const project = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            companyName: true,
          },
        },
      },
    })

    // If status changed, log it and handle transitions
    if (status && status.toUpperCase() !== currentProject.status) {
      const newStatus = status.toUpperCase()

      // If status changed to COMPLETED, update payment status for pending assignments
      if (newStatus === 'COMPLETED' && currentProject.status !== 'COMPLETED') {
        await prisma.projectAssignment.updateMany({
          where: {
            projectId: params.id,
            paymentStatus: 'UNPAID',
            paymentAmount: { not: null },
          },
          data: {
            paymentStatus: 'PENDING',
            paymentDueDate: new Date(),
          },
        })
      }

      // Create activity log for status change
      await prisma.activityLog.create({
        data: {
          type: 'project_status_change',
          userId: session.user.id,
          projectId: params.id,
          oldValue: currentProject.status,
          newValue: newStatus,
        },
      })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/projects/[id]
 * Delete project (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // TODO: Add admin role check here

    await prisma.project.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
