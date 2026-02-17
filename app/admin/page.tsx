import { headers } from 'next/headers'
import Link from 'next/link'
import { getUserFromHeaders } from '../lib/auth/get-user'
import { prisma } from '../lib/db/prisma'

export default async function AdminDashboard() {
  const headersList = await headers()
  const currentUser = getUserFromHeaders(headersList)

  // Get statistics
  const stats = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.user.count({ where: { questionnaireCompleted: true } }),
    prisma.document.count(),
  ])

  const [totalUsers, totalClients, completedQuestionnaires, totalDocuments] = stats

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      questionnaireCompleted: true,
    },
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-2 font-playfair">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Manage users, documents, and platform settings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Users</span>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-red-700">{totalUsers}</p>
          <Link
            href="/admin/users"
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium mt-2 inline-block"
          >
            Manage users →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Clients</span>
            <span className="text-2xl">🤝</span>
          </div>
          <p className="text-3xl font-bold text-red-700">{totalClients}</p>
          <Link
            href="/admin/clients"
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium mt-2 inline-block"
          >
            Manage clients →
          </Link>
        </div>


        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Completed Questionnaires</span>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-3xl font-bold text-red-700">{completedQuestionnaires}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {totalUsers > 0 ? Math.round((completedQuestionnaires / totalUsers) * 100) : 0}% completion rate
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Documents</span>
            <span className="text-2xl">📄</span>
          </div>
          <p className="text-3xl font-bold text-red-700">{totalDocuments}</p>
          <Link
            href="/admin/documents/upload"
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium mt-2 inline-block"
          >
            Upload document →
          </Link>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-black dark:text-white mb-4 font-playfair">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Questionnaire</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {user.name || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{user.email}</td>
                  <td className="py-3 px-4 text-sm">
                    {user.questionnaireCompleted ? (
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Link
            href="/admin/users"
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold"
          >
            View all users →
          </Link>
        </div>
      </div>
    </div>
  )
}
