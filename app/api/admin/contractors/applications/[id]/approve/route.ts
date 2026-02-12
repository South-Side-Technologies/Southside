import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { requireAdmin } from '@/app/lib/auth/roles'
import prisma from '@/app/lib/db/prisma'

/**
 * POST /api/admin/contractors/applications/[id]/approve
 * Approve a contractor application
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    requireAdmin(session?.user as any)

    const { id } = params

    // Update application status
    const application = await prisma.contractorApplication.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
      },
    })

    // Add CONTRACTOR role to user
    const user = await prisma.user.findUnique({
      where: { id: application.userId },
    })

    if (user) {
      const roles = Array.isArray(user.roles) ? user.roles : [user.roles]
      if (!roles.includes('CONTRACTOR')) {
        roles.push('CONTRACTOR')
        await prisma.user.update({
          where: { id: application.userId },
          data: { roles },
        })
      }
    }

    return NextResponse.json(application)
  } catch (error: any) {
    console.error('Error approving application:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to approve application' },
      { status: error.message?.includes('Admin') ? 403 : 500 }
    )
  }
}
