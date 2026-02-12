import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth/get-current-user'
import { prisma } from '../../../../lib/db/prisma'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

/**
 * GET /api/contractor/tickets/[id]
 * Fetch a specific ticket assigned to the contractor
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify contractor is assigned to this ticket
    const assignment = await prisma.ticketAssignment.findFirst({
      where: {
        userId: currentUser.id,
        supportTicketId: params.id,
      },
    })

    if (!assignment) {
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
