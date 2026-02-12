import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserByEmail } from '@/app/lib/db/user'
import { prisma } from '@/app/lib/db/prisma'
import type { Invoice } from '@/app/components/dashboard/InvoiceTable'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

interface Subscription {
  plan: string
  billing: 'monthly' | 'annual'
  amount: number
  nextBillingDate: string
  paymentMethod: {
    type: 'card' | 'bank'
    last4: string
  }
}

// Helper to format date as "Mon DD, YYYY"
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * GET /api/dashboard/billing
 * Returns subscription and invoice information for the authenticated user
 * Query parameters:
 *   - type: 'subscription' | 'invoices' | 'all' (default: 'all')
 * Protected by NextAuth
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from NextAuth session
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get query parameter
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

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

    // Fetch subscription if needed
    let subscription: Subscription | undefined
    if (type === 'subscription' || type === 'all') {
      const dbSubscription = await prisma.subscription.findUnique({
        where: { userId: dbUser.id },
      })

      if (dbSubscription) {
        subscription = {
          plan: dbSubscription.plan,
          billing: dbSubscription.billing.toLowerCase() as 'monthly' | 'annual',
          amount: dbSubscription.amount,
          nextBillingDate: formatDate(dbSubscription.nextBillingDate),
          paymentMethod: JSON.parse(dbSubscription.paymentMethod),
        }
      }
    }

    // Fetch invoices if needed
    let invoices: Invoice[] = []
    if (type === 'invoices' || type === 'all') {
      const dbInvoices = await prisma.invoice.findMany({
        where: { userId: dbUser.id },
        orderBy: { date: 'desc' },
      })

      invoices = dbInvoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        date: formatDate(inv.date),
        amount: inv.amount,
        status: inv.status.toLowerCase() as Invoice['status'],
        downloadUrl: inv.downloadUrl,
      }))
    }

    // Return based on type parameter
    if (type === 'subscription') {
      return NextResponse.json({ subscription })
    }

    if (type === 'invoices') {
      return NextResponse.json({ invoices })
    }

    // Default: return both
    return NextResponse.json({ subscription, invoices })
  } catch (error) {
    console.error('Error fetching billing information:', error)
    return NextResponse.json({ error: 'Failed to fetch billing information' }, { status: 500 })
  }
}
