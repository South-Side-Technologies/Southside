import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db/prisma'
import { getCustomerFolder } from '@/app/lib/storage/google-drive'
import { addUserToAccessGroup } from '@/app/lib/cloudflare/access-groups'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/register
 * Register a new customer account
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from NextAuth session
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be authenticated to register' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, companyName } = body

    // Validate required fields
    if (!name || !email || !companyName) {
      return NextResponse.json(
        { error: 'Name, email, and company name are required' },
        { status: 400 }
      )
    }

    // Security check: Email from form must match authenticated session email
    if (email !== session.user.email) {
      return NextResponse.json(
        { error: 'Email must match your authenticated account' },
        { status: 403 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        name,
        companyName,
        questionnaireCompleted: false,
      },
    })

    // Add user to Cloudflare Access "clients" group (optional, may not be needed with NextAuth)
    try {
      const result = await addUserToAccessGroup(email, 'clients')
      if (result.success) {
        console.log(`Added ${email} to Cloudflare Access clients group`)
      } else {
        console.warn(`Could not add ${email} to Cloudflare Access group: ${result.message}`)
      }
    } catch (accessGroupError) {
      // Log error but don't fail registration
      console.error('Failed to add user to Cloudflare Access group:', accessGroupError)
    }

    // Create Google Drive folder for the new customer
    try {
      const folderId = await getCustomerFolder(email)
      console.log(`Created Google Drive folder for ${email}: ${folderId}`)
    } catch (driveError) {
      // Log error but don't fail registration if Drive folder creation fails
      console.error('Failed to create Google Drive folder:', driveError)
    }

    // Send notification to Discord/n8n about new registration
    try {
      const discordWebhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL
      if (discordWebhookUrl) {
        await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [
              {
                title: '🎉 New Customer Registration',
                color: 3066993, // Green
                fields: [
                  { name: 'Name', value: name, inline: true },
                  { name: 'Email', value: email, inline: true },
                  ...(companyName ? [{ name: 'Company', value: companyName, inline: true }] : []),
                ],
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        })
      }
    } catch (notificationError) {
      console.error('Failed to send registration notification:', notificationError)
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        message: 'Account created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
