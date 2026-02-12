import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { requireAdmin } from '@/app/lib/auth/roles'
import prisma from '@/app/lib/db/prisma'

/**
 * GET /api/admin/contractors/applications
 * Get all contractor applications with full details
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    requireAdmin(session?.user as any)

    const applications = await prisma.contractorApplication.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return NextResponse.json(applications)
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch applications' },
      { status: error.message?.includes('Admin') ? 403 : 500 }
    )
  }
}
