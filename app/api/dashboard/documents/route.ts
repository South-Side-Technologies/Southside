import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserByEmail } from '@/app/lib/db/user'
import { prisma } from '@/app/lib/db/prisma'
import type { Document } from '@/app/components/dashboard/DocumentList'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Helper to format date as "Mon DD, YYYY"
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * GET /api/dashboard/documents
 * Returns list of documents for the authenticated user
 * Protected by NextAuth
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from NextAuth session
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get optional query parameter for filtering by category
    const { searchParams } = new URL(request.url)
    const categoryFilter = searchParams.get('category')?.toUpperCase()

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

    // Build query filter
    const whereClause: any = { userId: dbUser.id }
    if (categoryFilter && ['CONTRACT', 'INVOICE', 'REPORT', 'DOCUMENTATION'].includes(categoryFilter)) {
      whereClause.category = categoryFilter
    }

    // Fetch documents from database
    const dbDocuments = await prisma.document.findMany({
      where: whereClause,
      orderBy: { uploadedAt: 'desc' },
    })

    // Transform database documents to API format
    const documents: Document[] = dbDocuments.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      size: Number(d.size), // Convert BigInt to Number for JSON serialization
      category: d.category.toLowerCase() as Document['category'],
      uploadedAt: formatDate(d.uploadedAt),
      downloadUrl: d.downloadUrl,
    }))

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}
