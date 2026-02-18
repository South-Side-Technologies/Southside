import Link from 'next/link'
import { getCurrentUser } from '../lib/auth/get-current-user'
import prisma from '../lib/db/prisma'
import RecentActivity from '../components/RecentActivity'

export default async function DashboardPage() {
  // Get current user from NextAuth session
  const currentUser = await getCurrentUser()

  // If no user, shouldn't reach here due to middleware, but handle gracefully
  if (!currentUser) {
    return <div className="text-center py-8">Not authenticated</div>
  }

  // If user hasn't completed questionnaire, show only the questionnaire prompt
  if (!currentUser.questionnaireCompleted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="stat-card shadow-lg">
            <div className="text-6xl mb-6">👋</div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4 font-playfair">
              Welcome to South Side Tech, {currentUser.name || currentUser.email}!
            </h1>
            <p className="text-secondary text-lg mb-8">
              To get started, we'd like to learn more about your business needs and how we can best
              serve you. Please take a few minutes to complete our consultation questionnaire.
            </p>
            <Link
              href="/questionnaire"
              className="btn-primary py-4 px-8 text-lg"
            >
              Start Consultation
            </Link>
            <p className="text-muted text-sm mt-6">
              This will only take about 5 minutes
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Fetch real stats from database
  const [projectCount, ticketCount, documentCount] = await Promise.all([
    prisma.project.count({ where: { userId: currentUser.id, status: { not: 'COMPLETED' } } }),
    prisma.supportTicket.count({ where: { userId: currentUser.id, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    prisma.document.count({ where: { userId: currentUser.id } }),
  ])

  const stats = {
    activeProjects: projectCount,
    openTickets: ticketCount,
    documents: documentCount,
    nextInvoice: 'Feb 15, 2026', // TODO: Calculate from subscription
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 font-playfair">
          Welcome back, {currentUser.name || currentUser.email}!
        </h1>
        <p className="text-secondary text-lg">
          Here's what's happening with your projects and services.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Active Projects</span>
            <span className="text-2xl">🚀</span>
          </div>
          <p className="stat-value">{stats.activeProjects}</p>
          <Link
            href="/dashboard/projects"
            className="text-sm text-red-600 hover:text-red-300 font-medium mt-2 inline-block"
          >
            View all →
          </Link>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Open Tickets</span>
            <span className="text-2xl">💬</span>
          </div>
          <p className="stat-value">{stats.openTickets}</p>
          <Link
            href="/dashboard/support"
            className="text-sm text-red-600 hover:text-red-300 font-medium mt-2 inline-block"
          >
            View tickets →
          </Link>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Documents</span>
            <span className="text-2xl">📁</span>
          </div>
          <p className="stat-value">{stats.documents}</p>
          <Link
            href="/dashboard/documents"
            className="text-sm text-red-600 hover:text-red-300 font-medium mt-2 inline-block"
          >
            Browse →
          </Link>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Next Invoice</span>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-lg font-bold text-red-700">{stats.nextInvoice}</p>
          <Link
            href="/dashboard/billing"
            className="text-sm text-red-600 hover:text-red-300 font-medium mt-2 inline-block"
          >
            View billing →
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity - Using Real Data */}
        <RecentActivity />

        {/* Quick Actions */}
        <div className="stat-card">
          <h2 className="text-xl font-bold text-primary mb-4 font-playfair">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/dashboard/support"
              className="block w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
            >
              Create Support Ticket
            </Link>
            <Link
              href="/dashboard/documents"
              className="block w-full bg-gray-800 hover:bg-gray-700 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors text-center"
            >
              View Documents
            </Link>
            <Link
              href="/dashboard/billing"
              className="block w-full bg-gray-800 hover:bg-gray-700 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors text-center"
            >
              View Latest Invoice
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
