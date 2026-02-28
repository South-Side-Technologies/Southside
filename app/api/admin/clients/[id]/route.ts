import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/app/lib/db/prisma'

/**
 * GET /api/admin/clients/[id]
 * Fetch a specific client with their projects and support tickets
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    var session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const client = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        role: true,
        questionnaireCompleted: true,
        createdAt: true,
        projects: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            progress: true,
            startDate: true,
            estimatedCompletion: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        supportTickets: {
          select: {
            id: true,
            ticketNumber: true,
            subject: true,
            status: true,
            priority: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    )
  }
}
