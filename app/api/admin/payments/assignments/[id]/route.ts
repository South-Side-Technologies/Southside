import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { requireAdmin } from '@/app/lib/auth/roles'
import { prisma } from '@/app/lib/db/prisma'

/**
 * PATCH /api/admin/payments/assignments/[id]
 * Edit payment amount for an assignment (resets approval status)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    requireAdmin(session.user)

    const { paymentAmount, reviewNotes } = await request.json()

    // Validate payment amount
    if (paymentAmount === undefined || paymentAmount === null) {
      return NextResponse.json(
        { error: 'Payment amount is required' },
        { status: 400 }
      )
    }

    if (typeof paymentAmount !== 'number' || paymentAmount <= 0) {
      return NextResponse.json(
        { error: 'Payment amount must be a positive number' },
        { status: 400 }
      )
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      const assignment = await tx.projectAssignment.findUnique({
        where: { id: params.id },
        include: {
          project: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
        },
      })

      if (!assignment) {
        throw new Error('Assignment not found')
      }

      if (!assignment.paymentStatus || assignment.paymentStatus === 'PAID') {
        throw new Error('Cannot edit amount for assignments in PAID status')
      }

      const oldAmount = assignment.paymentAmount

      // Update amount and RESET approval status
      const updated = await tx.projectAssignment.update({
        where: { id: params.id },
        data: {
          paymentAmount,
          approvedForPayment: null, // Reset to not reviewed
          approvedBy: null,
          approvedAt: null,
          rejectionReason: null,
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
          type: 'assignment_payment_edited',
          userId: session.user.id,
          projectId: assignment.projectId,
          oldValue: oldAmount?.toString() || '0',
          newValue: paymentAmount.toString(),
          metadata: {
            assignmentId: assignment.id,
            contractorId: assignment.userId,
            contractorName: assignment.user.name,
            reviewNotes: reviewNotes || null,
            approvalReset: true,
          },
        },
      })

      return updated
    })

    return NextResponse.json({
      success: true,
      assignment: result,
      message: 'Payment amount updated. Approval status has been reset for re-review.',
    })
  } catch (error: any) {
    console.error('Error updating assignment payment amount:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update payment amount' },
      { status: error.message?.includes('not found') ? 404 : 400 }
    )
  }
}
