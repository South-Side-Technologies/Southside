import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/app/lib/db/prisma'

/**
 * GET /api/dashboard/billing/invoices
 * Fetch all invoices for the authenticated user
 */
export async function GET(request: NextRequest) {
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

    // Get invoices
    const invoices = await prisma.invoice.findMany({
      where: { userId: user.id },
      include: {
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

    // Transform for client
    const result = invoices.map((invoice) => ({
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
      createdAt: invoice.createdAt,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}
