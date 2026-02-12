import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserByEmail } from '@/app/lib/db/user'
import { prisma } from '@/app/lib/db/prisma'
import { createProjectFromQuestionnaire } from '@/app/lib/db/project'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.json()

    // Get or create user in database
    let dbUser = await getUserByEmail(session.user.email)

    if (!dbUser) {
      // Create user if doesn't exist
      dbUser = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || '',
        },
      })
    }

    // Update user data if any values changed from the form
    const updateData: {
      questionnaireCompleted: boolean
      name?: string
      companyName?: string
    } = {
      questionnaireCompleted: true,
    }

    // Update name if changed
    if (formData.contactName && formData.contactName !== dbUser.name) {
      updateData.name = formData.contactName
    }

    // Update companyName if changed
    if (formData.companyName && formData.companyName !== dbUser.companyName) {
      updateData.companyName = formData.companyName
    }

    // Mark user as having completed the questionnaire and update any changed fields
    await prisma.user.update({
      where: { id: dbUser.id },
      data: updateData,
    })

    // Create initial project from questionnaire data
    try {
      const project = await createProjectFromQuestionnaire(dbUser.id, {
        companyName: formData.companyName,
        interestedServices: formData.interestedServices,
        automationTechnologies: formData.automationTechnologies,
        otherTechnology: formData.otherTechnology,
        budget: formData.budget,
        companySize: formData.companySize,
        timeline: formData.timeline,
        additionalInfo: formData.additionalInfo,
      })

      console.log(`Created initial project for ${dbUser.email}: ${project.id}`)
    } catch (projectError) {
      // Log error but don't fail the entire questionnaire submission
      console.error('Failed to create initial project:', projectError)
      // Continue with the rest of the flow - project can be created manually by admin
    }

    // Note: Files are stored locally in public/uploads/ organized by company folders
    // No external folder creation needed

    // Send to Discord
    const discordWebhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1463327925007945728/8_Qan8OzLjvv9W1pK2zrOAKW87EfbBDFbU0qp18VTnqhsUxqToq6Kf0EqBHuIUpEMeeF'

    const discordMessage = {
      embeds: [
        {
          title: '📋 New Questionnaire Submission',
          color: 3447003, // Blue
          fields: [
            {
              name: 'Company Name',
              value: formData.companyName || 'Not provided',
              inline: true,
            },
            {
              name: 'Contact Name',
              value: formData.contactName || 'Not provided',
              inline: true,
            },
            {
              name: 'Email',
              value: formData.email || 'Not provided',
              inline: true,
            },
            {
              name: 'Phone',
              value: formData.phone || 'Not provided',
              inline: true,
            },
            {
              name: 'Company Size',
              value: formData.companySize || 'Not provided',
              inline: true,
            },
            {
              name: 'Interested Services',
              value: formData.interestedServices.length > 0
                ? formData.interestedServices.join(', ')
                : 'None selected',
              inline: false,
            },
            {
              name: 'Automation Technologies',
              value: formData.automationTechnologies.length > 0
                ? formData.automationTechnologies.join(', ')
                : 'None selected',
              inline: false,
            },
            ...(formData.otherTechnology
              ? [
                  {
                    name: 'Other Technology Details',
                    value: formData.otherTechnology,
                    inline: false,
                  },
                ]
              : []),
            {
              name: 'Budget Range',
              value: formData.budget || 'Not provided',
              inline: true,
            },
            {
              name: 'Timeline',
              value: formData.timeline || 'Not provided',
              inline: true,
            },
            {
              name: 'Additional Information',
              value: formData.additionalInfo || 'None provided',
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    }

    const discordResponse = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordMessage),
    })

    if (!discordResponse.ok) {
      console.error('Discord webhook failed:', discordResponse.statusText)
      throw new Error('Failed to send Discord notification')
    }

    // Also send to n8n if configured
    const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
    const n8nAuth = process.env.N8N_WEBHOOK_AUTH
    if (n8nWebhookUrl) {
      try {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(n8nAuth ? { Auth: n8nAuth } : {}),
          },
          body: JSON.stringify(formData),
        })
      } catch (err) {
        console.error('n8n webhook failed:', err)
        // Don't throw - Discord notification was successful
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Form submission error:', error)
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    )
  }
}
