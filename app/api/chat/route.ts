import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const webhookUrl = process.env.N8N_CHAT_WEBHOOK_URL
    const n8nAuth = process.env.N8N_WEBHOOK_AUTH

    if (!webhookUrl) {
      return NextResponse.json({ error: 'Chat webhook not configured' }, { status: 500 })
    }

    let webhookHost = webhookUrl
    try {
      webhookHost = new URL(webhookUrl).host
    } catch {
      // Keep full string if URL parsing fails.
    }
    console.info('Chat webhook request ->', webhookHost)

    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(n8nAuth ? { Auth: n8nAuth } : {}),
      },
      body: JSON.stringify({ message, sessionId }),
    })

    const contentType = n8nResponse.headers.get('content-type') || ''
    console.info('Chat webhook response', {
      status: n8nResponse.status,
      ok: n8nResponse.ok,
      contentType,
    })

    if (!n8nResponse.ok) {
      const errorBody = await n8nResponse.text()
      console.error('Chat webhook failed body:', errorBody.slice(0, 1000))
      return NextResponse.json({ error: 'Chat webhook failed' }, { status: 502 })
    }

    let reply = ''

    const normalizeReply = (value: unknown) => {
      if (typeof value === 'string') return value.trim()
      if (typeof value === 'number' || typeof value === 'boolean') return String(value)
      return ''
    }

    if (contentType.includes('application/json')) {
      const data = await n8nResponse.json()

      reply =
        normalizeReply(data?.reply) ||
        normalizeReply(data?.message) ||
        normalizeReply(data?.text) ||
        normalizeReply(data?.output) ||
        normalizeReply(data?.response) ||
        normalizeReply(data?.data?.reply) ||
        normalizeReply(data?.data?.message)

      if (!reply && Array.isArray(data) && data.length > 0) {
        const firstItem = data[0]
        reply =
          normalizeReply(firstItem?.reply) ||
          normalizeReply(firstItem?.message) ||
          normalizeReply(firstItem?.text) ||
          normalizeReply(firstItem?.output) ||
          normalizeReply(firstItem?.response) ||
          normalizeReply(firstItem?.json?.reply) ||
          normalizeReply(firstItem?.json?.message) ||
          normalizeReply(firstItem?.json?.text) ||
          normalizeReply(firstItem?.json?.output) ||
          normalizeReply(firstItem?.json?.response)
      }
    } else {
      reply = (await n8nResponse.text()).trim()
    }

    if (!reply) {
      return NextResponse.json({ error: 'Chat webhook returned no reply' }, { status: 502 })
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat submission error:', error)
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 })
  }
}
