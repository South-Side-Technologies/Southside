import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/app/lib/db/prisma'

/**
 * GET /api/dashboard/billing/invoices/[id]
 * Fetch a specific invoice with payment details
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

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            completedAt: true,
            description: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Check authorization
    if (invoice.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.date,
      dueDate: invoice.dueDate,
      amount: invoice.amount,
      status: invoice.status,
      description: invoice.description,
      paidAt: invoice.paidAt,
      project: invoice.project,
      payments: invoice.payments,
      downloadUrl: invoice.downloadUrl,
      lineItems: invoice.lineItems,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}
