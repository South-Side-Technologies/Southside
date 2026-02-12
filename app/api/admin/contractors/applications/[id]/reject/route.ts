import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { requireAdmin } from '@/app/lib/auth/roles'
import prisma from '@/app/lib/db/prisma'

/**
 * POST /api/admin/contractors/applications/[id]/reject
 * Reject a contractor application
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    requireAdmin(session?.user as any)

    const { id } = params
    const { reason } = await request.json()

    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Update application status
    const application = await prisma.contractorApplication.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    })

    return NextResponse.json(application)
  } catch (error: any) {
    console.error('Error rejecting application:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reject application' },
      { status: error.message?.includes('Admin') ? 403 : 500 }
    )
  }
}
