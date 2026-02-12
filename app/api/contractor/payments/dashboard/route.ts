import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { isAdmin, isContractor } from '@/app/lib/auth/roles'
import prisma from '@/app/lib/db/prisma'

/**
 * GET /api/contractor/payments/dashboard
 * Fetch contractor's earnings, payment history, and completed projects
 * Accessible by the contractor themselves or admin users
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Allow contractors, pending applicants, or admins to view payment data
    if (!isAdmin(session.user)) {
      // Check if user is a contractor or has a contractor application
      const hasApplication = await prisma.contractorApplication.findUnique({
        where: { userId: session.user.id },
      })

      if (!isContractor(session.user) && !hasApplication) {
        return NextResponse.json({ error: 'Contractor access required' }, { status: 403 })
      }
    }

    // Get completed projects with payment info
    const completedProjectsRaw = await prisma.projectAssignment.findMany({
      where: {
        userId: session.user.id,
        project: { status: 'COMPLETED' },
        paymentStatus: { in: ['UNPAID', 'PENDING', 'PROCESSING', 'PAID', 'FAILED'] },
      },
      include: {
        project: {
          include: {
            user: {
              select: {
                name: true,
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    })

    // Map to frontend format
    const completedProjects = completedProjectsRaw.map(assignment => ({
      id: assignment.id,
      projectId: assignment.projectId,
      projectName: assignment.project.name,
      customerName: assignment.project.user.companyName || assignment.project.user.name || 'Unknown',
      paymentAmount: assignment.paymentAmount || 0,
      paymentStatus: assignment.paymentStatus,
      paymentDueDate: assignment.paymentDueDate?.toISOString() || null,
      completedAt: assignment.updatedAt?.toISOString() || null,
    }))

    // Get payment history
    const paymentHistory = await prisma.contractorPayout.findMany({
      where: { contractorId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    // Map payment history to frontend format
    const paymentHistoryFormatted = paymentHistory.map(payout => ({
      id: payout.id,
      amount: payout.amount,
      status: payout.status,
      processedAt: payout.processedAt.toISOString(),
      stripeTransferId: payout.stripeTransferId,
    }))

    // Get user to check onboarding status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeOnboardingComplete: true },
    })

    // Calculate totals
    const totalEarnings = paymentHistory
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0)

    const pendingPayments = completedProjects
      .filter(a => a.paymentStatus === 'PENDING')
      .reduce((sum, a) => sum + a.paymentAmount, 0)

    return NextResponse.json({
      completedAssignments: completedProjects,
      paymentHistory: paymentHistoryFormatted,
      totalEarnings,
      pendingPayments,
      onboardingComplete: user?.stripeOnboardingComplete || false,
      completedProjects: completedProjects.length,
    })
  } catch (error: any) {
    console.error('Error fetching payment dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment data' },
      { status: 500 }
    )
  }
}
