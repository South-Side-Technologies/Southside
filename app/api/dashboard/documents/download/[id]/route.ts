import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserByEmail } from '@/app/lib/db/user'
import { prisma } from '@/app/lib/db/prisma'
import { getDownloadLink } from '@/app/lib/storage/google-drive'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/documents/download/[id]
 * Generate a temporary download link for a specific document
 * Protected by NextAuth
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from NextAuth session
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get or create user in database
    let dbUser = await getUserByEmail(session.user.email)

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || '',
        },
      })
    }

    // Get document from database
    const document = await prisma.document.findUnique({
      where: { id: params.id },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Verify user owns this document
    if (document.userId !== dbUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You do not have access to this document' },
        { status: 403 }
      )
    }

    // Generate download link from Google Drive
    // The downloadUrl field stores the Google Drive fileId
    const downloadUrl = await getDownloadLink(document.downloadUrl)

    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'Failed to generate download link' },
        { status: 500 }
      )
    }

    return NextResponse.json({ downloadUrl })
  } catch (error) {
    console.error('Error generating download link:', error)
    return NextResponse.json(
      { error: 'Failed to generate download link' },
      { status: 500 }
    )
  }
}
