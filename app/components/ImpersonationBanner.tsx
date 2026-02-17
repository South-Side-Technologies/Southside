'use client'

import React, { useState } from 'react'

interface ImpersonationBannerProps {
  isImpersonating: boolean
  impersonatedUserEmail?: string
}

export default function ImpersonationBanner({ isImpersonating, impersonatedUserEmail }: ImpersonationBannerProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isImpersonating) {
    return null
  }

  const handleStopImpersonation = async () => {
    if (!confirm('Stop impersonating and return to admin account?')) {
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/impersonate', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to stop impersonation')
      }

      // Redirect to admin panel
      window.location.href = '/admin/users'
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to stop impersonation')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-yellow-500 text-white py-2 px-4 text-center font-semibold">
      <div className="flex items-center justify-center gap-4">
        <span>
          ⚠️ Impersonating: <strong>{impersonatedUserEmail}</strong>
        </span>
        <button
          onClick={handleStopImpersonation}
          disabled={isLoading}
          className="bg-black text-yellow-500 px-4 py-1 rounded font-semibold hover:bg-gray-800 disabled:opacity-50 text-sm"
        >
          {isLoading ? 'Stopping...' : 'Stop Impersonation'}
        </button>
      </div>
    </div>
  )
}
