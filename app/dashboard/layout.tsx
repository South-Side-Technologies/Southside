import { getCurrentUser } from '../lib/auth/get-current-user'
import Header from '../components/Header'
import Footer from '../components/Footer'
import DashboardNav from '../components/dashboard/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get current user from NextAuth session
  const currentUser = await getCurrentUser()

  // questionnaireCompleted is already included in the current user object from the session
  const questionnaireCompleted = currentUser?.questionnaireCompleted ?? false

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header variant="authenticated" currentUser={currentUser} />

      <div className="flex flex-1">
        <DashboardNav showFullNav={questionnaireCompleted} />

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <Footer variant="minimal" />
    </div>
  )
}
