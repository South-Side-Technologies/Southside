import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '../lib/auth/get-current-user'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default async function ContractorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get current user from NextAuth session
  const currentUser = await getCurrentUser()

  // If not authenticated, redirect to login
  // Note: Role-specific logic is handled by the page components themselves
  // - /contractor/page.tsx shows onboarding for non-contractors
  // - /contractor/dashboard redirects already-approved contractors
  if (!currentUser) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header variant="authenticated" currentUser={currentUser} />

      <div className="flex flex-1">
        {/* Contractor Sidebar - Only show for approved contractors */}
        {currentUser.roles?.includes('CONTRACTOR') && (
          <nav className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 px-4 py-6 hidden lg:block">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-red-700 mb-2">Contractor Panel</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage your work</p>
            </div>

            <div className="space-y-2">
              <Link
                href="/contractor"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Dashboard</span>
              </Link>

              {/* Only show Projects and Tickets if payment setup is complete */}
              {currentUser.stripeOnboardingComplete && (
                <>
                  <Link
                    href="/contractor/projects"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span>Projects</span>
                  </Link>

                  <Link
                    href="/contractor/tickets"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m-4 0v2m4 0a1 1 0 00-1-1h-2a1 1 0 00-1 1m0 0H9m7 0v2m0-2a1 1 0 01-1-1V5a1 1 0 011-1h2a1 1 0 011 1v2m0 0h1v2m-2 2h1" />
                    </svg>
                    <span>Tickets</span>
                  </Link>
                </>
              )}

              <Link
                href="/contractor/payments"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Payments</span>
              </Link>
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-auto bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <Footer variant="minimal" />
    </div>
  )
}
