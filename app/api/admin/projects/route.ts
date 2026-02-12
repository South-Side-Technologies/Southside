import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/app/lib/db/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/projects
 * Fetch all projects across all users (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // TODO: Add admin role check here when roles are implemented
    // For now, any authenticated user can access (will add role-based auth later)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Build query filter
    const where: any = status && status !== 'all' ? { status: status.toUpperCase() } : {}

    const projects = await prisma.project.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            companyName: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching admin projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/projects
 * Create new project for any user (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // TODO: Add admin role check here

    const body = await request.json()
    const {
      name,
      description,
      status,
      progress,
      startDate,
      estimatedCompletion,
      assignedTeam,
      userId,
    } = body

    // Validate required fields
    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Name and userId are required' },
        { status: 400 }
      )
    }

    // Validate status enum
    const validStatuses = ['PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']
    if (status && !validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Validate progress range
    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return NextResponse.json(
        { error: 'Progress must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        status: status ? status.toUpperCase() : 'PLANNING',
        progress: progress || 0,
        startDate: startDate ? new Date(startDate) : new Date(),
        estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion) : null,
        assignedTeam: assignedTeam || [],
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            companyName: true,
          },
        },
      },
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
