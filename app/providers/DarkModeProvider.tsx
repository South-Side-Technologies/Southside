'use client'

import { createContext, useContext, useState } from 'react'

type DarkModeContextType = {
  isDark: boolean
  toggleDarkMode: () => void
}

export const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined)

function initializeDarkMode() {
  const isDarkAlreadyApplied = document.documentElement.classList.contains('dark')
  const savedMode = localStorage.getItem('darkMode')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return savedMode ? savedMode === 'true' : prefersDark
}

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return initializeDarkMode()
  })

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    applyTheme(newDarkMode)
  }

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (!context) {
    throw new Error('useDarkMode must be used within DarkModeProvider')
  }
  return context
}
