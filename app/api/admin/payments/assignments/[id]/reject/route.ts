import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { requireAdmin } from '@/app/lib/auth/roles'
import { prisma } from '@/app/lib/db/prisma'

/**
 * POST /api/admin/payments/assignments/[id]/reject
 * Reject a project assignment payment with reason
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

    const { rejectionReason, reviewNotes } = await request.json()

    // Validate rejection reason is provided
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get current assignment state with related data
      const assignment = await tx.projectAssignment.findUnique({
        where: { id: params.id },
        include: {
          project: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      })

      if (!assignment) {
        throw new Error('Assignment not found')
      }

      // Validate assignment can be rejected
      if (assignment.paymentStatus !== 'PENDING') {
        throw new Error(
          `Assignment must be in PENDING status, current status: ${assignment.paymentStatus}`
        )
      }

      // Update assignment with rejection
      const updated = await tx.projectAssignment.update({
        where: { id: params.id },
        data: {
          approvedForPayment: false,
          approvedBy: session.user.id,
          approvedAt: new Date(),
          rejectionReason,
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
          type: 'assignment_rejected',
          userId: session.user.id,
          projectId: assignment.projectId,
          metadata: {
            assignmentId: assignment.id,
            contractorId: assignment.userId,
            contractorName: assignment.user.name,
            amount: assignment.paymentAmount,
            rejectionReason,
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
    console.error('Error rejecting assignment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reject assignment' },
      { status: error.message?.includes('not found') ? 404 : 400 }
    )
  }
}
