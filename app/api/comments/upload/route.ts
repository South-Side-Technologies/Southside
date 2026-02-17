import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth/auth-options'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return Response.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return Response.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Create uploads/comments directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'comments')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-')
    const uniqueFileName = `${timestamp}-${originalName}`
    const filePath = join(uploadsDir, uniqueFileName)

    // Save file to disk
    const buffer = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(buffer))

    // Return the public URL
    const url = `/uploads/comments/${uniqueFileName}`

    return Response.json({ url })
  } catch (error) {
    console.error('Image upload error:', error)
    return Response.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
