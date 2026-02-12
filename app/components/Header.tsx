'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import type { CloudflareUser } from '../lib/types/auth'
import { getUserDisplayName, getUserInitials } from '../lib/auth/session'

const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="36" height="36" rx="8" fill="#8B2E2E" />
    <path d="M12 20C12 15.58 15.58 12 20 12C24.42 12 28 15.58 28 20C28 24.42 24.42 28 20 28C15.58 28 12 24.42 12 20Z" fill="white" />
    <circle cx="20" cy="20" r="4" fill="#8B2E2E" />
  </svg>
)

interface HeaderProps {
  variant?: 'public' | 'authenticated'
  currentUser?: CloudflareUser | null
  subtitle?: string
}

export default function Header({ variant = 'public', currentUser, subtitle }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3 py-4 md:py-6">
          <Link href="/" className="flex items-center gap-2 md:gap-3 animate-slide-in-left hover:opacity-80 transition-opacity justify-center md:justify-start">
            <Logo />
            <h1 className="text-2xl md:text-3xl font-bold text-black font-alfa">South Side Tech</h1>
          </Link>

          {variant === 'public' && !currentUser && (
            <p className="text-gray-600 text-sm md:text-base animate-slide-in-right animate-delay-100 text-center md:text-right">
              {subtitle || 'Tech Solutions for Every Business'}
            </p>
          )}

          {variant === 'authenticated' && currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-red-700 text-white flex items-center justify-center font-semibold text-sm">
                  {getUserInitials(currentUser)}
                </div>
                <span className="text-gray-700 font-medium hidden md:block">{getUserDisplayName(currentUser)}</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{getUserDisplayName(currentUser)}</p>
                      <p className="text-sm text-gray-500 truncate">{currentUser.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/projects"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Projects
                    </Link>
                    <Link
                      href="/dashboard/support"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Support
                    </Link>
                    <div className="border-t border-gray-200 my-2" />
                    <button
                      onClick={() => {
                        // Logout handled by Cloudflare Access
                        window.location.href = '/'
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {variant === 'public' && (
          <nav className="flex flex-wrap gap-2 pb-4 border-t border-gray-100 justify-center md:justify-start">
            <Link href="/customer-login" className="px-4 py-2 text-gray-700 font-semibold border-b-2 border-transparent hover:border-b-2 hover:border-red-700 hover:text-red-700 transition-colors duration-300 text-sm md:text-base">
              Customer Login
            </Link>
            <Link href="/customer-login" className="px-4 py-2 text-gray-700 font-semibold border-b-2 border-transparent hover:border-b-2 hover:border-red-700 hover:text-red-700 transition-colors duration-300 text-sm md:text-base">
              Start Consultation
            </Link>
            <Link href="/#chatbot" className="px-4 py-2 text-gray-700 font-semibold border-b-2 border-transparent hover:border-b-2 hover:border-red-700 hover:text-red-700 transition-colors duration-300 text-sm md:text-base">
              Chatbot
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
