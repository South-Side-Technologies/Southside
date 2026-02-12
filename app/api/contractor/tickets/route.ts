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

    const tickets = await prisma.ticketAssignment.findMany({
      where: {
        userId: currentUser.id,
        ...(statusFilter && { supportTicket: { status: statusFilter as any } }),
      },
      include: {
        supportTicket: {
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
      tickets: tickets.map(assignment => ({
        id: assignment.supportTicket.id,
        ticketNumber: assignment.supportTicket.ticketNumber,
        subject: assignment.supportTicket.subject,
        description: assignment.supportTicket.description,
        status: assignment.supportTicket.status,
        priority: assignment.supportTicket.priority,
        createdAt: assignment.supportTicket.createdAt.toISOString(),
        user: assignment.supportTicket.user,
      })),
    })
  } catch (error) {
    console.error('Error fetching contractor tickets:', error)
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }
}
