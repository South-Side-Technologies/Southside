import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { requireAdmin } from '@/app/lib/auth/roles'
import prisma from '@/app/lib/db/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify admin access
    requireAdmin(session.user)

    const body = await request.json()
    const { userId, paymentAmount } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Verify user exists and is a contractor
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.role !== 'CONTRACTOR') {
      return NextResponse.json(
        { error: 'Invalid contractor' },
        { status: 404 }
      )
    }

    // Create assignment with payment amount
    const assignment = await prisma.projectAssignment.create({
      data: {
        projectId: params.id,
        userId: userId,
        assignedBy: session.user?.id,
        paymentAmount: paymentAmount || null,
        paymentStatus: 'UNPAID',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      assignment,
      message: 'Contractor assigned successfully',
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Contractor is already assigned to this project' },
        { status: 400 }
      )
    }
    console.error('Error assigning contractor:', error)
    return NextResponse.json(
      { error: 'Failed to assign contractor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify admin access
    requireAdmin(session.user)

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Delete assignment
    await prisma.projectAssignment.delete({
      where: {
        projectId_userId: {
          projectId: params.id,
          userId: userId,
        },
      },
    })

    return NextResponse.json({
      message: 'Contractor unassigned successfully',
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }
    console.error('Error removing contractor assignment:', error)
    return NextResponse.json(
      { error: 'Failed to remove contractor assignment' },
      { status: 500 }
    )
  }
}
