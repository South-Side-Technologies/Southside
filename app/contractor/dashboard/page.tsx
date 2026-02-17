import Link from 'next/link'
import { getCurrentUser } from '@/app/lib/auth/get-current-user'
import { prisma } from '@/app/lib/db/prisma'

export default async function ContractorDashboard() {
  const currentUser = await getCurrentUser()

  if (!currentUser?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Unable to load user information</p>
        </div>
      </div>
    )
  }

  // Check if payment setup is complete
  const stripeOnboardingComplete = currentUser.stripeOnboardingComplete || false

  // Fetch contractor's assigned projects only if payment is setup
  const totalProjects = stripeOnboardingComplete ? await prisma.projectAssignment.count({
    where: { userId: currentUser.id },
  }) : 0

  const inProgressProjects = stripeOnboardingComplete ? await prisma.projectAssignment.count({
    where: {
      userId: currentUser.id,
      project: { status: 'IN_PROGRESS' },
    },
  }) : 0

  const assignedTickets = stripeOnboardingComplete ? await prisma.ticketAssignment.count({
    where: {
      userId: currentUser.id,
      supportTicket: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
    },
  }) : 0

  // Get recent projects only if payment is setup
  const recentProjects = stripeOnboardingComplete ? await prisma.projectAssignment.findMany({
    where: { userId: currentUser.id },
    include: {
      project: {
        include: {
          user: {
            select: {
              name: true,
              companyName: true,
            },
          },
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
    take: 5,
  }) : []

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Contractor Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back, {currentUser.name || currentUser.email}</p>
      </div>

      {/* Payment Setup Required Banner */}
      {!stripeOnboardingComplete && (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M9 3h6a3 3 0 013 3v12a3 3 0 01-3 3H9a3 3 0 01-3-3V6a3 3 0 013-3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Complete Payment Setup</h3>
              <p className="text-amber-800 mb-4">
                You need to complete your payment setup before you can access projects and support tickets.
              </p>
              <Link
                href="/contractor/payments"
                className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm"
              >
                Set Up Payments Now →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Assigned Projects</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalProjects}</p>
            </div>
            <svg className="w-12 h-12 text-red-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{inProgressProjects}</p>
            </div>
            <svg className="w-12 h-12 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Open Tickets</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{assignedTickets}</p>
            </div>
            <svg className="w-12 h-12 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Payments</p>
              <p className="text-gray-900 dark:text-white font-medium mt-2 text-sm">Manage earnings</p>
              <Link
                href="/contractor/payments"
                className="text-red-700 hover:text-red-900 text-xs font-semibold inline-block mt-1"
              >
                View Dashboard →
              </Link>
            </div>
            <svg className="w-12 h-12 text-purple-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Contractor Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
              <p className="text-gray-900 dark:text-white font-medium">{currentUser.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
              <p className="text-gray-900 dark:text-white font-medium">{currentUser.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
              <p className="text-gray-900 dark:text-white font-medium">{currentUser.role}</p>
            </div>
          </div>
        </div>

        {/* Support Tickets */}
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${!stripeOnboardingComplete ? 'opacity-50 pointer-events-none' : ''}`}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Support Tickets</h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Open/In Progress Tickets</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{assignedTickets}</p>
            {stripeOnboardingComplete ? (
              <Link
                href="/contractor/tickets"
                className="text-red-700 hover:text-red-900 text-sm font-medium inline-block mt-2"
              >
                View All Tickets →
              </Link>
            ) : (
              <p className="text-sm text-gray-500 mt-2">Complete payment setup to view tickets</p>
            )}
          </div>
        </div>
      </div>

      {/* Currently Assigned Projects */}
      {stripeOnboardingComplete ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Currently Assigned Projects</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentProjects.length > 0 ? (
                  recentProjects.map((assignment) => (
                    <tr
                      key={assignment.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
                      onClick={() => window.location.href = `/contractor/projects/${assignment.project.id}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {assignment.project.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {assignment.project.user.companyName || assignment.project.user.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          assignment.project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          assignment.project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          assignment.project.status === 'REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}>
                          {assignment.project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-red-700 h-2 rounded-full"
                              style={{ width: `${assignment.project.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">{assignment.project.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No projects assigned yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 p-8">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Projects Locked</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Complete your payment setup to view and work on assigned projects</p>
            <Link
              href="/contractor/payments"
              className="inline-block px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors font-medium text-sm"
            >
              Set Up Payments Now →
            </Link>
          </div>
        </div>
      )}

      {/* Contractor Documents */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Documents</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Upload and manage your contractor documents. Files are organized by company.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard/documents"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium w-fit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Manage Documents
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Note: Documents are stored securely and organized by company
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
