import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/app/lib/db/prisma'

/**
 * POST /api/comments
 * Create a new comment on a project or support ticket
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, projectId, supportTicketId } = await request.json()

    if (!content || (!projectId && !supportTicketId)) {
      return NextResponse.json(
        { error: 'Content and either projectId or supportTicketId are required' },
        { status: 400 }
      )
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create the comment
    const data: any = {
      content,
      userId: user.id,
    }

    if (projectId) {
      data.projectId = projectId
    }
    if (supportTicketId) {
      data.supportTicketId = supportTicketId
    }

    const comment = await prisma.comment.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          type: 'comment',
          userId: user.id,
          projectId: projectId || undefined,
          supportTicketId: supportTicketId || undefined,
          newValue: 'created',
          metadata: {
            commentId: comment.id,
            content: content,
          },
        },
      })
    } catch (logError) {
      console.error('Error logging activity:', logError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/comments?projectId=xxx OR /api/comments?supportTicketId=xxx
 * Fetch comments for a project or support ticket
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const supportTicketId = searchParams.get('supportTicketId')

    if (!projectId && !supportTicketId) {
      return NextResponse.json(
        { error: 'Either projectId or supportTicketId is required' },
        { status: 400 }
      )
    }

    const comments = await prisma.comment.findMany({
      where: projectId
        ? { projectId }
        : { supportTicketId: supportTicketId! },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}
