import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { requireAdmin } from '@/app/lib/auth/roles'
import { prisma } from '@/app/lib/db/prisma'

/**
 * POST /api/admin/payments/assignments/[id]/approve
 * Approve a project assignment for payment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    requireAdmin(session.user)

    const { reviewNotes } = await request.json()

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get current assignment state with related data
      const assignment = await tx.projectAssignment.findUnique({
        where: { id: params.id },
        include: {
          project: { select: { status: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      })

      if (!assignment) {
        throw new Error('Assignment not found')
      }

      // Validate assignment can be approved
      if (assignment.paymentStatus !== 'PENDING') {
        throw new Error(
          `Assignment must be in PENDING status, current status: ${assignment.paymentStatus}`
        )
      }

      if (assignment.project.status !== 'COMPLETED') {
        throw new Error('Project must be COMPLETED to approve payment')
      }

      if (!assignment.paymentAmount || assignment.paymentAmount <= 0) {
        throw new Error('Invalid payment amount')
      }

      // Update assignment with approval
      const updated = await tx.projectAssignment.update({
        where: { id: params.id },
        data: {
          approvedForPayment: true,
          approvedBy: session.user.id,
          approvedAt: new Date(),
          reviewNotes: reviewNotes || null,
        },
        include: {
          project: true,
          user: true,
        },
      })

      // Create activity log entry
      await tx.activityLog.create({
        data: {
          type: 'assignment_approved',
          userId: session.user.id,
          projectId: assignment.projectId,
          metadata: {
            assignmentId: assignment.id,
            contractorId: assignment.userId,
            contractorName: assignment.user.name,
            amount: assignment.paymentAmount,
            reviewNotes: reviewNotes || null,
          },
        },
      })

      return updated
    })

    return NextResponse.json({
      success: true,
      assignment: result,
    })
  } catch (error: any) {
    console.error('Error approving assignment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to approve assignment' },
      { status: error.message?.includes('not found') ? 404 : 400 }
    )
  }
}
