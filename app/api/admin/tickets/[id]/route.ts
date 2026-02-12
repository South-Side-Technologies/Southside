import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/app/lib/db/prisma'

/**
 * GET /api/admin/tickets/[id]
 * Fetch a specific ticket
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const ticket = await prisma.supportTicket.findUnique({
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

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/tickets/[id]
 * Update a ticket
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { status, priority, subject, description } = await request.json()

    // Get current ticket to check for status change
    const currentTicket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      select: { userId: true, status: true },
    })

    const ticket = await prisma.supportTicket.update({
      where: { id: params.id },
      data: {
        ...(status && { status: status.toUpperCase() }),
        ...(priority && { priority: priority.toUpperCase() }),
        ...(subject && { subject }),
        ...(description !== undefined && { description }),
      },
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

    // Log status change if it occurred
    if (status && currentTicket && currentTicket.status !== status.toUpperCase()) {
      await prisma.activityLog.create({
        data: {
          type: 'ticket_status_change',
          userId: currentTicket.userId,
          supportTicketId: params.id,
          oldValue: currentTicket.status,
          newValue: status.toUpperCase(),
        },
      })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/tickets/[id]
 * Delete a ticket
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.supportTicket.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting ticket:', error)
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    )
  }
}
