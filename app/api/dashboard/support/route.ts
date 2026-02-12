import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserByEmail } from '@/app/lib/db/user'
import { prisma } from '@/app/lib/db/prisma'
import type { SupportTicket } from '@/app/components/dashboard/SupportTicketList'

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

  if (diffMins < 1) return 'Just now'
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
 * GET /api/dashboard/support
 * Returns list of support tickets for the authenticated user
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

    // Fetch support tickets from database
    const dbTickets = await prisma.supportTicket.findMany({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: 'desc' },
    })

    // Transform database tickets to API format
    const tickets: SupportTicket[] = dbTickets.map((t) => ({
      id: t.ticketNumber,
      subject: t.subject,
      status: t.status.toLowerCase() as SupportTicket['status'],
      priority: t.priority.toLowerCase() as SupportTicket['priority'],
      createdAt: formatDate(t.createdAt),
      updatedAt: getRelativeTime(t.updatedAt),
    }))

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Error fetching support tickets:', error)
    return NextResponse.json({ error: 'Failed to fetch support tickets' }, { status: 500 })
  }
}

/**
 * POST /api/dashboard/support
 * Create a new support ticket
 * Protected by NextAuth
 */
export async function POST(request: NextRequest) {
  try {
    // Get user from NextAuth session
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { subject, priority, description } = body

    if (!subject || !description) {
      return NextResponse.json(
        { error: 'Subject and description are required' },
        { status: 400 }
      )
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

    // Generate ticket number (simple incrementing ID - in production, use a better system)
    const latestTicket = await prisma.supportTicket.findFirst({
      orderBy: { ticketNumber: 'desc' },
    })
    const ticketNumber = latestTicket
      ? String(parseInt(latestTicket.ticketNumber) + 1)
      : '1000'

    // Create ticket in database
    const dbTicket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject,
        description,
        status: 'OPEN',
        priority: (priority || 'MEDIUM').toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        userId: dbUser.id,
      },
    })

    // Transform to API format
    const newTicket: SupportTicket = {
      id: dbTicket.ticketNumber,
      subject: dbTicket.subject,
      status: dbTicket.status.toLowerCase() as SupportTicket['status'],
      priority: dbTicket.priority.toLowerCase() as SupportTicket['priority'],
      createdAt: formatDate(dbTicket.createdAt),
      updatedAt: 'Just now',
    }

    return NextResponse.json({ ticket: newTicket }, { status: 201 })
  } catch (error) {
    console.error('Error creating support ticket:', error)
    return NextResponse.json({ error: 'Failed to create support ticket' }, { status: 500 })
  }
}
