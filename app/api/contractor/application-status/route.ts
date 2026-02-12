import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/app/lib/db/prisma'

/**
 * GET /api/contractor/application-status
 * Check the status of the current user's contractor application
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const application = await prisma.contractorApplication.findUnique({
      where: { userId },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        rejectionReason: true,
        companyName: true,
      },
    })

    if (!application) {
      return NextResponse.json({ hasApplication: false })
    }

    return NextResponse.json({
      hasApplication: true,
      application: {
        id: application.id,
        status: application.status,
        submittedAt: application.submittedAt,
        reviewedAt: application.reviewedAt,
        rejectionReason: application.rejectionReason,
        companyName: application.companyName,
      },
    })
  } catch (error: any) {
    console.error('Error fetching application status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application status' },
      { status: 500 }
    )
  }
}
