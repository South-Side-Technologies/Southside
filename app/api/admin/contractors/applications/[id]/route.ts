import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { requireAdmin } from '@/app/lib/auth/roles'
import prisma from '@/app/lib/db/prisma'

/**
 * GET /api/admin/contractors/applications/[id]
 * Get a specific contractor application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    requireAdmin(session?.user as any)

    const { id } = params

    const application = await prisma.contractorApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            stripeOnboardingComplete: true,
            stripeConnectAccountId: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(application)
  } catch (error: any) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch application' },
      { status: error.message?.includes('Admin') ? 403 : 500 }
    )
  }
}

/**
 * PATCH /api/admin/contractors/applications/[id]
 * Update a contractor application
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    requireAdmin(session?.user as any)

    const { id } = params
    const data = await request.json()

    // Safe fields to update
    const safeFields = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      companyName: data.companyName,
      bio: data.bio,
      serviceCategories: data.serviceCategories,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
    }

    // Remove undefined fields
    const updateData = Object.fromEntries(
      Object.entries(safeFields).filter(([, v]) => v !== undefined)
    )

    const updated = await prisma.contractorApplication.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update application' },
      { status: error.message?.includes('Admin') ? 403 : 500 }
    )
  }
}
