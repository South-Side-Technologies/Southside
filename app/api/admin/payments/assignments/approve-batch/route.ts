import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { requireAdmin } from '@/app/lib/auth/roles'
import { prisma } from '@/app/lib/db/prisma'

/**
 * POST /api/admin/payments/assignments/approve-batch
 * Bulk approve multiple project assignments
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    requireAdmin(session.user)

    const { assignmentIds, reviewNotes } = await request.json()

    // Validate input
    if (
      !assignmentIds ||
      !Array.isArray(assignmentIds) ||
      assignmentIds.length === 0
    ) {
      return NextResponse.json(
        { error: 'assignmentIds array is required and must not be empty' },
        { status: 400 }
      )
    }

    if (assignmentIds.some((id) => typeof id !== 'string')) {
      return NextResponse.json(
        { error: 'All assignmentIds must be strings' },
        { status: 400 }
      )
    }

    // Process each assignment in transaction
    const results = await prisma.$transaction(async (tx) => {
      const successResults: any[] = []
      const failureResults: any[] = []

      for (const assignmentId of assignmentIds) {
        try {
          // Get assignment with validation
          const assignment = await tx.projectAssignment.findUnique({
            where: { id: assignmentId },
            include: {
              project: { select: { status: true } },
              user: { select: { id: true, name: true } },
            },
          })

          if (!assignment) {
            failureResults.push({
              assignmentId,
              success: false,
              error: 'Assignment not found',
            })
            continue
          }

          // Validate assignment can be approved
          if (assignment.paymentStatus !== 'PENDING') {
            failureResults.push({
              assignmentId,
              success: false,
              error: `Assignment status must be PENDING, current: ${assignment.paymentStatus}`,
            })
            continue
          }

          if (assignment.project.status !== 'COMPLETED') {
            failureResults.push({
              assignmentId,
              success: false,
              error: 'Project must be COMPLETED',
            })
            continue
          }

          if (!assignment.paymentAmount || assignment.paymentAmount <= 0) {
            failureResults.push({
              assignmentId,
              success: false,
              error: 'Invalid payment amount',
            })
            continue
          }

          // Approve the assignment
          const updated = await tx.projectAssignment.update({
            where: { id: assignmentId },
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
                bulkApproval: true,
              },
            },
          })

          successResults.push({
            assignmentId,
            success: true,
            assignment: updated,
          })
        } catch (error: any) {
          failureResults.push({
            assignmentId,
            success: false,
            error: error.message || 'Unknown error',
          })
        }
      }

      return { successResults, failureResults }
    })

    const successCount = results.successResults.length
    const failureCount = results.failureResults.length

    return NextResponse.json({
      summary: {
        total: assignmentIds.length,
        successful: successCount,
        failed: failureCount,
      },
      results: results.successResults,
      errors: failureCount > 0 ? results.failureResults : [],
    })
  } catch (error: any) {
    console.error('Error bulk approving assignments:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to bulk approve assignments' },
      { status: 400 }
    )
  }
}
