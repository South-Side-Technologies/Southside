import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { requireAdmin } from '@/app/lib/auth/roles'
import { prisma } from '@/app/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    requireAdmin(session.user)

    const contractors = await prisma.user.findMany({
      where: {
        roles: { has: 'CONTRACTOR' },
      },
      select: {
        id: true,
        email: true,
        name: true,
        stripeOnboardingComplete: true,
        stripeConnectAccountId: true,
      },
    })

    const contractorPayments = await Promise.all(
      contractors.map(async (contractor) => {
        const pendingAssignments = await prisma.projectAssignment.findMany({
          where: {
            userId: contractor.id,
            paymentStatus: 'PENDING',
          },
        })

        const pendingAmount = pendingAssignments.reduce(
          (sum, assignment) => sum + (assignment.paymentAmount || 0),
          0
        )

        return {
          id: contractor.id,
          email: contractor.email,
          name: contractor.name,
          pendingAmount,
          assignmentCount: pendingAssignments.length,
          stripeOnboardingComplete: contractor.stripeOnboardingComplete,
        }
      })
    )

    const filtered = contractorPayments.filter((c) => c.pendingAmount > 0 || c.assignmentCount > 0)

    return NextResponse.json(filtered)
  } catch (error: any) {
    console.error('Error fetching pending payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending payments' },
      { status: 500 }
    )
  }
}
