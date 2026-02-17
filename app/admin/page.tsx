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
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 font-playfair">
          Admin Dashboard
        </h1>
        <p className="text-secondary text-lg">
          Manage users, documents, and platform settings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Total Users</span>
            <span className="text-2xl">👥</span>
          </div>
          <p className="stat-value">{totalUsers}</p>
          <Link
            href="/admin/users"
            className="text-sm text-red-400 hover:text-red-700:text-red-300 font-medium mt-2 inline-block"
          >
            Manage users →
          </Link>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Total Clients</span>
            <span className="text-2xl">🤝</span>
          </div>
          <p className="stat-value">{totalClients}</p>
          <Link
            href="/admin/clients"
            className="text-sm text-red-400 hover:text-red-700:text-red-300 font-medium mt-2 inline-block"
          >
            Manage clients →
          </Link>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Completed Questionnaires</span>
            <span className="text-2xl">✅</span>
          </div>
          <p className="stat-value">{completedQuestionnaires}</p>
          <p className="stat-subtext">
            {totalUsers > 0 ? Math.round((completedQuestionnaires / totalUsers) * 100) : 0}% completion rate
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Total Documents</span>
            <span className="text-2xl">📄</span>
          </div>
          <p className="stat-value">{totalDocuments}</p>
          <Link
            href="/admin/documents/upload"
            className="text-sm text-red-400 hover:text-red-700:text-red-300 font-medium mt-2 inline-block"
          >
            Upload document →
          </Link>
        </div>
      </div>

      {/* Recent Users */}
      <div className="stat-card">
        <h2 className="text-xl font-bold text-primary mb-4 font-playfair">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 border-b border-gray-700">
                <th className="table-header-cell">Name</th>
                <th className="table-header-cell">Email</th>
                <th className="table-header-cell">Questionnaire</th>
                <th className="table-header-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className="table-row">
                  <td className="table-cell">
                    {user.name || 'N/A'}
                  </td>
                  <td className="table-cell">{user.email}</td>
                  <td className="table-cell">
                    {user.questionnaireCompleted ? (
                      <span className="badge-success">
                        Completed
                      </span>
                    ) : (
                      <span className="badge-warning">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="table-cell text-muted">
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
            className="text-sm text-red-400 hover:text-red-700:text-red-300 font-semibold"
          >
            View all users →
          </Link>
        </div>
      </div>
    </div>
  )
}
