'use client'

import { useEffect, useRef, useState } from 'react'

type ChatMessage = {
  role: 'assistant' | 'user'
  content: string
}

const initialMessages: ChatMessage[] = [
  {
    role: 'assistant',
    content: 'Hi! Ask me about services, pricing, or how we can help your business.',
  },
]

export default function ChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesRef = useRef<ChatMessage[]>(initialMessages)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const resolveSessionId = () => {
    const storageKey = 'southside_chat_session_id'
    const existing = window.localStorage.getItem(storageKey)
    if (existing) {
      if (!sessionId) setSessionId(existing)
      return existing
    }

    const generated = typeof crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

    window.localStorage.setItem(storageKey, generated)
    setSessionId(generated)
    return generated
  }

  useEffect(() => {
    resolveSessionId()
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isSending) return

    setError(null)
    setInput('')

    const nextMessages: ChatMessage[] = [...messagesRef.current, { role: 'user' as const, content: trimmed }]
    setMessages(nextMessages)
    setIsSending(true)

    try {
      const currentSessionId = resolveSessionId()
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          sessionId: currentSessionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Chat request failed')
      }

      const data = await response.json()
      const reply =
        data.reply ||
        data.message ||
        data.text ||
        data.output ||
        'Thanks for reaching out. A specialist will follow up shortly.'

      setMessages((prev) => [...prev, { role: 'assistant' as const, content: reply }])
    } catch (err) {
      setError('Sorry, the chat is unavailable right now.')
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant' as const,
          content: 'Sorry, the chat is unavailable right now. Please try again soon.',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white px-6 py-4">
        <p className="text-lg font-bold font-playfair">South Side Chat</p>
        <p className="text-red-100 text-sm">Connect instantly with our automated assistant.</p>
      </div>
      <div ref={scrollRef} className="max-h-80 md:max-h-96 overflow-y-auto px-6 py-5 space-y-4 bg-red-50/40">
        {messages.map((message, index) => {
          const isUser = message.role === 'user'
          return (
            <div key={`${message.role}-${index}`} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm md:text-base shadow-sm ${
                  isUser
                    ? 'bg-red-700 text-white rounded-br-md'
                    : 'bg-white text-gray-800 border border-red-100 rounded-bl-md'
                }`}
              >
                {message.content}
              </div>
            </div>
          )
        })}
      </div>
      <div className="px-6 py-4 bg-white border-t border-red-100">
        <div className="flex flex-col md:flex-row gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask a question about automations, pricing, or support..."
            rows={2}
            className="flex-1 resize-none rounded-xl border border-red-100 px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || input.trim().length === 0}
            className="bg-red-700 text-white font-semibold rounded-xl px-6 py-3 text-sm md:text-base transition-all hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  )
}
