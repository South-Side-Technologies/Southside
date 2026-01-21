import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Send to Discord
    const discordWebhookUrl = 'https://discord.com/api/webhooks/1463327925007945728/8_Qan8OzLjvv9W1pK2zrOAKW87EfbBDFbU0qp18VTnqhsUxqToq6Kf0EqBHuIUpEMeeF'

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
    if (n8nWebhookUrl) {
      try {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
