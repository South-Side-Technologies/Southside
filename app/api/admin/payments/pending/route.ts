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

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') // pending | approved | rejected | all
    const view = searchParams.get('view') || 'contractor' // contractor | assignment

    // Build filter for approval status
    const approvalFilter: any = {}
    if (statusFilter === 'approved') {
      approvalFilter.approvedForPayment = true
    } else if (statusFilter === 'rejected') {
      approvalFilter.approvedForPayment = false
    } else if (statusFilter === 'pending') {
      approvalFilter.approvedForPayment = null
    }
    // 'all' means no filter

    // Fetch all PENDING assignments with approval status
    const assignments = await prisma.projectAssignment.findMany({
      where: {
        paymentStatus: 'PENDING',
        paymentAmount: { not: null },
        ...approvalFilter,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            stripeOnboardingComplete: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { approvedForPayment: 'asc' }, // null first (not reviewed), then false (rejected), then true (approved)
        { assignedAt: 'desc' },
      ],
    })

    if (view === 'assignment') {
      // Return flat list of assignments
      const formattedAssignments = assignments.map((a) => ({
        id: a.id,
        projectId: a.project.id,
        projectName: a.project.name,
        projectStatus: a.project.status,
        contractorId: a.user.id,
        contractorName: a.user.name,
        contractorEmail: a.user.email,
        paymentAmount: a.paymentAmount,
        paymentStatus: a.paymentStatus,
        approvedForPayment: a.approvedForPayment,
        approvedBy: a.approver?.name || null,
        approvedAt: a.approvedAt,
        rejectionReason: a.rejectionReason,
        reviewNotes: a.reviewNotes,
        assignedAt: a.assignedAt,
      }))

      return NextResponse.json({ assignments: formattedAssignments })
    }

    // Group by contractor (default view)
    const grouped = new Map<
      string,
      {
        contractorId: string
        contractorName: string
        contractorEmail: string
        stripeOnboardingComplete: boolean
        totalPending: number
        totalApproved: number
        totalRejected: number
        assignments: any[]
      }
    >()

    assignments.forEach((assignment) => {
      const contractorId = assignment.user.id
      if (!grouped.has(contractorId)) {
        grouped.set(contractorId, {
          contractorId,
          contractorName: assignment.user.name || 'Unknown',
          contractorEmail: assignment.user.email,
          stripeOnboardingComplete: assignment.user.stripeOnboardingComplete,
          totalPending: 0,
          totalApproved: 0,
          totalRejected: 0,
          assignments: [],
        })
      }

      const contractor = grouped.get(contractorId)!

      // Track totals by approval status
      if (assignment.approvedForPayment === null) {
        contractor.totalPending += assignment.paymentAmount || 0
      } else if (assignment.approvedForPayment === true) {
        contractor.totalApproved += assignment.paymentAmount || 0
      } else {
        contractor.totalRejected += assignment.paymentAmount || 0
      }

      // Add assignment to list
      contractor.assignments.push({
        id: assignment.id,
        projectId: assignment.project.id,
        projectName: assignment.project.name,
        projectStatus: assignment.project.status,
        paymentAmount: assignment.paymentAmount,
        approvedForPayment: assignment.approvedForPayment,
        approvedBy: assignment.approver?.name || null,
        approvedAt: assignment.approvedAt,
        rejectionReason: assignment.rejectionReason,
        reviewNotes: assignment.reviewNotes,
        assignedAt: assignment.assignedAt,
      })
    })

    const contractors = Array.from(grouped.values()).filter(
      (c) => c.totalPending > 0 || c.totalApproved > 0 || c.totalRejected > 0
    )

    return NextResponse.json({
      contractors,
      summary: {
        totalContractors: contractors.length,
        totalAssignments: assignments.length,
        totalPendingAmount: assignments
          .filter((a) => a.approvedForPayment === null)
          .reduce((sum, a) => sum + (a.paymentAmount || 0), 0),
        totalApprovedAmount: assignments
          .filter((a) => a.approvedForPayment === true)
          .reduce((sum, a) => sum + (a.paymentAmount || 0), 0),
        totalRejectedAmount: assignments
          .filter((a) => a.approvedForPayment === false)
          .reduce((sum, a) => sum + (a.paymentAmount || 0), 0),
      },
    })
  } catch (error: any) {
    console.error('Error fetching pending payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending payments' },
      { status: 500 }
    )
  }
}
