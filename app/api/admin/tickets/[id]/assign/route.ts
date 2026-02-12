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
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create assignment
    const assignment = await prisma.ticketAssignment.create({
      data: {
        supportTicketId: params.id,
        userId: userId,
        assignedBy: session.user?.id,
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
        { error: 'Contractor is already assigned to this ticket' },
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
    await prisma.ticketAssignment.delete({
      where: {
        supportTicketId_userId: {
          supportTicketId: params.id,
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
