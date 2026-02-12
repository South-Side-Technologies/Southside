import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth/get-current-user'
import { prisma } from '../../../../lib/db/prisma'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/support/[id]
 * Fetch a specific support ticket for the logged-in user
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

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        OR: [
          { ticketNumber: params.id }, // Human-readable ticket number (e.g., "1234")
          { id: params.id }, // Database ID
        ],
      },
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

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Verify ownership
    if (ticket.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Return ticket with actual database ID for comments
    return NextResponse.json({
      ticket: {
        ...ticket,
        databaseId: ticket.id,
      },
    })
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    )
  }
}
