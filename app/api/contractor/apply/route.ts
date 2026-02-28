import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { isContractor } from '@/app/lib/auth/roles'
import prisma from '@/app/lib/db/prisma'

/**
 * POST /api/contractor/apply
 * Submit a contractor application
 * User must not already be a contractor and must not have a pending application
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = session.user as any
    const userId = user.id

    // Check if user is already a contractor
    if (isContractor(user)) {
      return NextResponse.json(
        { error: 'User is already a contractor' },
        { status: 400 }
      )
    }

    // Check if there's already a pending/approved application
    const existingApp = await prisma.contractorApplication.findUnique({
      where: { userId }
    })

    if (existingApp && (existingApp.status === 'PENDING' || existingApp.status === 'APPROVED')) {
      return NextResponse.json(
        { error: 'Application already exists', applicationId: existingApp.id },
        { status: 400 }
      )
    }

    const body = await request.json()

    const {
      fullName,
      email,
      companyName,
      companyRegistration,
      businessType,
      phone,
      website,
      portfolio,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      bankAccountName,
      bankRoutingNumber,
      bankAccountNumber,
      bankAccountType,
      setupPaymentNow,
      serviceCategories,
      bio,
    } = body

    // Validate required fields
    if (!fullName || !email) {
      return NextResponse.json(
        { error: 'Full name and email are required' },
        { status: 400 }
      )
    }

    // Create application
    const application = await prisma.contractorApplication.create({
      data: {
        userId,
        fullName,
        email,
        companyName: companyName || null,
        companyRegistration: companyRegistration || null,
        businessType: businessType || null,
        phone: phone || null,
        website: website || null,
        portfolio: portfolio || null,
        addressLine1: addressLine1 || null,
        addressLine2: addressLine2 || null,
        city: city || null,
        state: state || null,
        postalCode: postalCode || null,
        country: country || null,
        bankAccountName: bankAccountName || null,
        bankRoutingNumber: bankRoutingNumber || null,
        bankAccountNumber: bankAccountNumber || null,
        bankAccountType: bankAccountType || null,
        setupPaymentNow: setupPaymentNow || false,
        serviceCategories: serviceCategories || [],
        bio: bio || null,
      },
    })

    // Add CONTRACTOR role to user on application submission
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (dbUser) {
      const roles = Array.isArray(dbUser.roles) ? dbUser.roles : [dbUser.roles]
      if (!roles.includes('CONTRACTOR')) {
        roles.push('CONTRACTOR')
        await prisma.user.update({
          where: { id: userId },
          data: { roles },
        })
      }
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'contractor_application_submitted',
        userId,
        newValue: 'PENDING',
        metadata: {
          applicationId: application.id,
          companyName: application.companyName,
        },
      },
    })

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      message: 'Application submitted successfully.',
    })
  } catch (error: any) {
    console.error('Error submitting contractor application:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
