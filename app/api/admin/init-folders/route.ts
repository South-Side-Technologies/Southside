import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/app/lib/db/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/init-folders
 * Initialize default folders (Billing, Technical) for all users or a specific user
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user session
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId } = await request.json()

    const defaultFolders = ['Billing', 'Technical']
    let usersToProcess = []

    if (userId) {
      // Initialize folders for specific user
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      usersToProcess = [user]
    } else {
      // Initialize folders for all users
      usersToProcess = await prisma.user.findMany()
    }

    const results = []

    for (const user of usersToProcess) {
      for (const folderName of defaultFolders) {
        // Check if folder already exists in database
        const existingFolder = await prisma.folder.findUnique({
          where: {
            userId_name: {
              userId: user.id,
              name: folderName,
            },
          },
        })

        if (!existingFolder) {
          // Create folder in database
          await prisma.folder.create({
            data: {
              name: folderName,
              userId: user.id,
            },
          })
          results.push({
            user: user.email,
            folder: folderName,
            status: 'created',
          })
        } else {
          results.push({
            user: user.email,
            folder: folderName,
            status: 'already_exists',
          })
        }
      }
    }

    return NextResponse.json({
      message: 'Folder initialization complete',
      results,
      totalUsersProcessed: usersToProcess.length,
    })
  } catch (error) {
    console.error('Error initializing folders:', error)
    return NextResponse.json(
      { error: 'Failed to initialize folders' },
      { status: 500 }
    )
  }
}
