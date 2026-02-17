'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Dashboard Icons
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const ProjectsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)

const SupportIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const DocumentsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const BillingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
)

interface NavLinkProps {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
}

function NavLink({ href, icon, label, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-red-700 text-white font-semibold'
          : 'text-gray-300 hover:bg-red-900/20 hover:text-red-400'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

interface DashboardNavProps {
  showFullNav?: boolean
}

export default function DashboardNav({ showFullNav = false }: DashboardNavProps) {
  const pathname = usePathname()

  const allNavItems = [
    {
      href: '/dashboard',
      icon: <DashboardIcon />,
      label: 'Dashboard',
      isActive: pathname === '/dashboard',
    },
    {
      href: '/dashboard/projects',
      icon: <ProjectsIcon />,
      label: 'Projects',
      isActive: pathname?.startsWith('/dashboard/projects'),
    },
    {
      href: '/dashboard/support',
      icon: <SupportIcon />,
      label: 'Support',
      isActive: pathname?.startsWith('/dashboard/support'),
    },
    {
      href: '/dashboard/documents',
      icon: <DocumentsIcon />,
      label: 'Documents',
      isActive: pathname?.startsWith('/dashboard/documents'),
    },
    {
      href: '/dashboard/billing',
      icon: <BillingIcon />,
      label: 'Billing',
      isActive: pathname?.startsWith('/dashboard/billing'),
    },
  ]

  // Only show Dashboard item until user completes questionnaire
  const navItems = showFullNav ? allNavItems : [allNavItems[0]]

  return (
    <nav className="w-64 bg-gray-950 border-r border-gray-800 px-4 py-6 hidden lg:block fixed left-0 top-[73px] h-[calc(100vh-73px)] z-40">
      <div className="space-y-2">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </div>
    </nav>
  )
}
