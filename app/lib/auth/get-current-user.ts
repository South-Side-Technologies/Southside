import { getServerSession } from 'next-auth'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import { prisma } from '../db/prisma'

/**
 * Get the current authenticated user from NextAuth session
 * Also fetches the latest data from the database to ensure fresh questionnaireCompleted status
 * Use this in server components and API routes
 *
 * @returns User object with id, email, role, etc. or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  // Fetch fresh user data from database to ensure we have the latest questionnaireCompleted status
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      roles: true,
      questionnaireCompleted: true,
    },
  })

  if (!dbUser) {
    return null
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    image: dbUser.image,
    role: dbUser.role,
    roles: (dbUser.roles && dbUser.roles.length > 0) ? dbUser.roles : [dbUser.role || 'CLIENT'],
    questionnaireCompleted: dbUser.questionnaireCompleted,
  }
}

/**
 * Get the current user or throw an error if not authenticated
 * Use this in protected server components/routes
 */
export async function getCurrentUserOrThrow() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  return user
}

/**
 * Check if the current user is an admin
 */
export async function isCurrentUserAdmin() {
  const user = await getCurrentUser()
  return user?.role === 'ADMIN'
}

/**
 * Check if the current user is a contractor
 */
export async function isCurrentUserContractor() {
  const user = await getCurrentUser()
  return user?.role === 'CONTRACTOR'
}

/**
 * Check if the current user is a client
 */
export async function isCurrentUserClient() {
  const user = await getCurrentUser()
  return user?.role === 'CLIENT'
}
