import { prisma } from './prisma'
import type { User } from '@prisma/client'
import type { CloudflareUser } from '../types/auth'

/**
 * Find or create user from Cloudflare Access JWT
 * This ensures every authenticated user has a database record
 *
 * @param cloudflareUser - User info from validated JWT
 * @returns Database user record
 */
export async function findOrCreateUser(cloudflareUser: CloudflareUser): Promise<User> {
  const { email, sub, name } = cloudflareUser

  // Try to find existing user by Cloudflare sub (user ID)
  let user = await prisma.user.findUnique({
    where: { sub },
  })

  if (user) {
    // Update name if it changed
    if (name && user.name !== name) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name },
      })
    }
    return user
  }

  // Create new user
  try {
    user = await prisma.user.create({
      data: {
        email,
        sub,
        name,
      },
    })
    return user
  } catch (error) {
    // Handle race condition - another request might have created the user
    console.error('Error creating user, attempting to find existing:', error)
    const existingUser = await prisma.user.findUnique({
      where: { sub },
    })

    if (!existingUser) {
      throw new Error('Failed to create or find user')
    }

    return existingUser
  }
}

/**
 * Get user by email
 *
 * @param email - User email address
 * @returns User or null
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  })
}

/**
 * Get user by Cloudflare sub (user ID)
 *
 * @param sub - Cloudflare user ID
 * @returns User or null
 */
export async function getUserBySub(sub: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { sub },
  })
}
