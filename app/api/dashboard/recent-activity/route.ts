import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db/prisma'

/**
 * GET /api/dashboard/recent-activity
 * Fetch recent activity logs with related project and ticket data
 */
export async function GET(request: NextRequest) {
  try {
    const activities = await prisma.activityLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        supportTicket: {
          select: {
            id: true,
            subject: true,
          },
        },
      },
    })

    // Transform to match frontend expected format
    const formattedActivities = activities.map(activity => ({
      type: activity.type,
      id: activity.id,
      createdAt: activity.createdAt.toISOString(),
      user: activity.user,
      project: activity.project,
      ticket: activity.supportTicket,
      name: activity.project?.name,
      subject: activity.supportTicket?.subject,
      oldValue: activity.oldValue,
      newValue: activity.newValue,
      content: activity.metadata?.content,
    }))

    return NextResponse.json(formattedActivities)
  } catch (error: any) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}
