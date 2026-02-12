import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/app/lib/storage/local-storage'
import { prisma } from '@/app/lib/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/documents/upload
 * Upload a document for a specific customer to Google Drive
 * Protected by NextAuth
 * TODO: Add admin role check
 */
export async function POST(request: NextRequest) {
  try {
    // Get admin user from NextAuth session
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // TODO: Add admin role check here
    // For now, any authenticated user can upload (will add role-based auth later)

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const customerEmail = formData.get('customerEmail') as string
    const category = formData.get('category') as string

    // Validate required fields
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!customerEmail) {
      return NextResponse.json({ error: 'Customer email is required' }, { status: 400 })
    }

    if (!category) {
      return NextResponse.json({ error: 'Document category is required' }, { status: 400 })
    }

    // Validate category
    const validCategories = ['CONTRACT', 'INVOICE', 'REPORT', 'DOCUMENTATION']
    if (!validCategories.includes(category.toUpperCase())) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB' },
        { status: 400 }
      )
    }

    // Find customer user in database
    const customerUser = await prisma.user.findUnique({
      where: { email: customerEmail },
    })

    if (!customerUser) {
      return NextResponse.json(
        {
          error: 'Customer not found',
          message: `No user found with email: ${customerEmail}. Please ensure the customer exists in the database.`,
        },
        { status: 404 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Validate company name and ID
    if (!customerUser.companyName || !customerUser.companyId) {
      return NextResponse.json(
        {
          error: 'Customer company information not set',
          message: `User ${customerEmail} must have company name and ID to upload documents. Please update their profile.`,
        },
        { status: 400 }
      )
    }

    // Determine folder based on category
    let folderName: string
    const categoryUpper = category.toUpperCase()
    if (categoryUpper === 'INVOICE' || categoryUpper === 'CONTRACT') {
      folderName = 'Billing'
    } else {
      folderName = 'Technical'
    }

    // Get or create the folder for this user
    let folder = await prisma.folder.findUnique({
      where: {
        userId_name: {
          userId: customerUser.id,
          name: folderName,
        },
      },
    })

    // If folder doesn't exist, create it
    if (!folder) {
      folder = await prisma.folder.create({
        data: {
          name: folderName,
          userId: customerUser.id,
        },
      })
    }

    // Upload file to local storage
    console.log(`Uploading file ${file.name} for company ${customerUser.companyName} (${customerUser.companyId}) to ${folderName} folder...`)
    const { fileName, downloadPath } = await uploadFile(
      customerUser.companyId,
      customerUser.companyName,
      file.name,
      buffer,
      folderName // Pass subfolder name
    )
    console.log(`File uploaded successfully. Path: ${downloadPath}`)

    // Save document metadata to database
    const document = await prisma.document.create({
      data: {
        name: file.name,
        type: file.type.split('/')[1] || 'unknown',
        size: BigInt(file.size),
        category: category.toUpperCase() as 'CONTRACT' | 'INVOICE' | 'REPORT' | 'DOCUMENTATION',
        downloadUrl: downloadPath, // Store local download path
        userId: customerUser.id,
        folderId: folder.id, // Link to database folder
      },
    })

    return NextResponse.json(
      {
        success: true,
        document: {
          id: document.id,
          name: document.name,
          size: file.size,
          category: category.toUpperCase(),
          downloadPath,
        },
        message: `Successfully uploaded ${file.name} for ${customerEmail}`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error uploading document:', error)

    return NextResponse.json(
      {
        error: 'Failed to upload document',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
