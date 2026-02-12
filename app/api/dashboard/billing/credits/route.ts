import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/app/lib/db/prisma'

/**
 * GET /api/dashboard/billing/credits
 * Fetch user's credit balance and transaction history
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

    // Get or create credit balance
    let creditBalance = await prisma.creditBalance.findUnique({
      where: { userId: user.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!creditBalance) {
      creditBalance = await prisma.creditBalance.create({
        data: { userId: user.id },
        include: {
          transactions: true,
        },
      })
    }

    return NextResponse.json({
      id: creditBalance.id,
      currentBalance: creditBalance.currentBalance,
      lifetimeCredits: creditBalance.lifetimeCredits,
      lifetimeUsed: creditBalance.lifetimeUsed,
      transactions: creditBalance.transactions,
    })
  } catch (error) {
    console.error('Error fetching credit balance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credit balance' },
      { status: 500 }
    )
  }
}
