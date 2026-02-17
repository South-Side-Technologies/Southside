'use client'

import { useState, useEffect } from 'react'
import RichTextEditor from './RichTextEditor'

function formatTimeAgo(date: string): string {
  const now = new Date()
  const createdAt = new Date(date)
  const diffMs = now.getTime() - createdAt.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface CommentsSectionProps {
  projectId?: string
  supportTicketId?: string
}

export default function CommentsSection({ projectId, supportTicketId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const queryParam = projectId ? `projectId=${projectId}` : `supportTicketId=${supportTicketId}`

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments?${queryParam}`)
        if (!response.ok) throw new Error('Failed to fetch comments')
        const data = await response.json()
        setComments(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch comments')
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [queryParam])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if comment is empty (TipTap empty state is just <p></p>)
    const trimmedContent = newComment.trim().replace(/^<p><\/p>$/, '').trim()
    if (!trimmedContent) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          projectId: projectId || undefined,
          supportTicketId: supportTicketId || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to create comment')
      const comment = await response.json()
      setComments([...comments, comment])
      setNewComment('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Comments</h3>

      {/* Comments List */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {loading ? (
          <p className="text-gray-400 text-center py-4">Loading comments...</p>
        ) : error ? (
          <p className="text-red-400 text-center py-4">{error}</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-l-4 border-red-700 pl-4 py-2">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-white text-sm">{comment.user.name || comment.user.email}</p>
                <p className="text-xs text-gray-400">
                  {formatTimeAgo(comment.createdAt)}
                </p>
              </div>
              <div className="comment-content text-gray-300 text-sm" dangerouslySetInnerHTML={{ __html: comment.content }} />
            </div>
          ))
        )}
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="border-t border-gray-700 pt-4 space-y-3">
        <RichTextEditor
          content={newComment}
          onChange={setNewComment}
          placeholder="Add a comment..."
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim() || newComment.trim().replace(/^<p><\/p>$/, '').trim() === ''}
          className="px-4 py-2 bg-red-700 text-white rounded-lg font-medium hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  )
}
