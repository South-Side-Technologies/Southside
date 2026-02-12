import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/app/lib/db/prisma'
import { v4 as uuidv4 } from 'uuid'

/**
 * POST /api/admin/invoices
 * Create a new invoice (admin only)
 * Body: {
 *   userId: string,
 *   amount: number,
 *   description?: string,
 *   dueDate?: ISO8601 string,
 *   projectId?: string,
 *   lineItems?: any[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, amount, description, dueDate, projectId, lineItems } = body

    // Validate required fields
    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'userId, amount (> 0) are required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify project if specified
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true },
      })

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
    }

    // Generate invoice number (simple sequential with timestamp)
    const invoiceNumber = `INV-${Date.now()}-${uuidv4().slice(0, 8)}`

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        userId,
        amount,
        date: new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
        status: 'PENDING',
        description: description || undefined,
        projectId: projectId || undefined,
        lineItems: lineItems || undefined,
        downloadUrl: '', // Would be generated when PDF is created
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'invoice_created',
        userId: session.user.id,
        newValue: 'PENDING',
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber,
          amount,
          targetUserId: userId,
          projectId: projectId || null,
        },
      },
    })

    return NextResponse.json(
      {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        date: invoice.date,
        dueDate: invoice.dueDate,
        status: invoice.status,
        description: invoice.description,
        projectId: invoice.projectId,
        createdAt: invoice.createdAt,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/invoices
 * List all invoices (admin only) with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (userId) where.userId = userId

    // Get invoices
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            companyName: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            completedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}
