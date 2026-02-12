import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/app/lib/db/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/users/[id]/documents
 * Get documents for a specific user (admin only)
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch documents for this user with folder info
    const documents = await prisma.document.findMany({
      where: { userId: params.id },
      orderBy: [{ folderId: 'asc' }, { uploadedAt: 'desc' }],
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
        category: true,
        uploadedAt: true,
        downloadUrl: true,
        folderId: true,
      },
    })

    // Fetch folders for this user
    const folders = await prisma.folder.findMany({
      where: { userId: params.id },
      orderBy: { name: 'asc' },
    })

    // Transform documents to API format and organize by folder
    const formattedDocuments = documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      size: Number(doc.size),
      category: doc.category.toLowerCase(),
      uploadedAt: doc.uploadedAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      downloadUrl: doc.downloadUrl,
      folderId: doc.folderId,
    }))

    return NextResponse.json({
      documents: formattedDocuments,
      folders: folders,
    })
  } catch (error) {
    console.error('Error fetching user documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}
