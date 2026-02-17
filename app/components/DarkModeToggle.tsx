'use client'

import { useContext } from 'react'
import { DarkModeContext } from '@/app/providers/DarkModeProvider'

export default function DarkModeToggle() {
  const context = useContext(DarkModeContext)

  // Return null if not within provider context (to avoid error)
  if (!context) {
    return null
  }

  const { isDark, toggleDarkMode } = context

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle dark mode"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.828-2.828l.707-.707a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414zm.464-4.536l.707-.707a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414zm-2.828 2.828l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 111.414-1.414zM13 11a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM9 17a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm4-4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM3 15a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm10-7a1 1 0 011 1v1a1 1 0 11-2 0V9a1 1 0 011-1zM3 5a1 1 0 011 1v1a1 1 0 11-2 0V6a1 1 0 011-1zm0 12a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  )
}
