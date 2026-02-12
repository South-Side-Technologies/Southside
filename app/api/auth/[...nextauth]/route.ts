import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '../../../lib/db/prisma'
import { ADMIN_EMAILS } from '../../../lib/auth/roles'

// Validate required environment variables
console.log('[NextAuth INIT] Starting NextAuth initialization...')
const requiredEnvVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET']
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar]
  if (!value) {
    console.error(`[NextAuth INIT] Missing required environment variable: ${envVar}`)
  } else {
    const masked = envVar === 'GOOGLE_CLIENT_SECRET' ? '***' : value.substring(0, 10) + '...'
    console.log(`[NextAuth INIT] ${envVar}: ${masked}`)
  }
}
console.log('[NextAuth INIT] NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
console.log('[NextAuth INIT] Configuration complete')

console.log('[NextAuth CONFIG] Building authOptions...')
console.log('[NextAuth CONFIG] NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
console.log('[NextAuth CONFIG] Expected callback URL:', `${process.env.NEXTAUTH_URL}/api/auth/callback/google`)
console.log('[NextAuth CONFIG] trustHost is set to: true')
console.log('[NextAuth CONFIG] secret is set:', !!process.env.NEXTAUTH_SECRET)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  debug: true, // Enable NextAuth debug logging
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'consent',
        },
      },
      async profile(profile) {
        console.log('[NextAuth GoogleProvider] Profile received:', profile)
        // Map Google's 'sub' field to 'id' for NextAuth compatibility
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
      wellKnown: 'https://accounts.google.com/.well-known/openid-configuration',
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      try {
        console.log('[NextAuth JWT] Called with user:', user?.email, 'token email:', token.email)

        // Get email from either user object or token
        const email = user?.email || (token.email as string)

        if (email) {
          // Always fetch fresh user data from database to ensure roles are current
          const dbUser = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              role: true,
              roles: true,
              questionnaireCompleted: true,
            },
          })

          if (dbUser) {
            token.id = dbUser.id
            token.email = dbUser.email
            // Use roles array if populated, otherwise fall back to single role
            token.role = dbUser.role || 'CLIENT'
            token.roles = (dbUser.roles && dbUser.roles.length > 0) ? dbUser.roles : [dbUser.role || 'CLIENT']
            token.questionnaireCompleted = dbUser.questionnaireCompleted as boolean
            console.log('[NextAuth JWT] User roles from DB:', token.roles)
          }
        }

        // If session was updated (e.g., via signOut), handle it
        if (trigger === 'update' && session) {
          token.questionnaireCompleted = session.questionnaireCompleted
        }

        return token
      } catch (error) {
        console.error('[NextAuth JWT] Error:', error)
        throw error
      }
    },
    async session({ session, token }) {
      try {
        console.log('[NextAuth session] Building session for:', session.user?.email)
        // Add token data to session
        if (session.user && token) {
          session.user.id = (token.id as string) || ''
          session.user.roles = (token.roles as string[]) || ['CLIENT']
          // For backward compatibility, set 'role' to primary role
          session.user.role = (token.role as string) || 'CLIENT'
          session.user.questionnaireCompleted = (token.questionnaireCompleted as boolean) || false
          console.log('[NextAuth session] Session built successfully with roles:', session.user.roles)
        }
        return session
      } catch (error) {
        console.error('[NextAuth session] Error:', error)
        throw error
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        console.log('[NextAuth redirect] Redirect called with url:', url, 'baseUrl:', baseUrl)

        // Allow redirects to same origin
        if (url.startsWith('/')) {
          console.log('[NextAuth redirect] Redirecting to relative URL:', url)
          return url
        }

        // Check if redirect URL is on the same origin
        try {
          const urlObj = new URL(url)
          if (urlObj.origin === baseUrl) {
            console.log('[NextAuth redirect] Redirecting to same-origin URL:', urlObj.pathname + urlObj.search)
            return urlObj.pathname + urlObj.search
          }
        } catch (e) {
          console.log('[NextAuth redirect] Could not parse URL:', url)
        }

        // Default to dashboard
        console.log('[NextAuth redirect] Defaulting to /dashboard')
        return '/dashboard'
      } catch (error) {
        console.error('[NextAuth redirect] Error:', error)
        throw error
      }
    },
    async signIn({ user, profile, account }) {
      try {
        console.log('[NextAuth signIn] ===== SIGN IN CALLBACK INVOKED =====')
        console.log('[NextAuth signIn] Starting signIn for:', user?.email)
        console.log('[NextAuth signIn] User object:', JSON.stringify(user, null, 2))
        console.log('[NextAuth signIn] Profile object:', JSON.stringify(profile, null, 2))
        console.log('[NextAuth signIn] Account object:', JSON.stringify(account, null, 2))

        if (!user?.email) {
          console.error('[NextAuth signIn] Missing email')
          return false
        }

        console.log('[NextAuth signIn] Upserting user:', user.email)

        // PrismaAdapter automatically handles Account creation, just update User with role
        const isAdmin = ADMIN_EMAILS.includes(user.email)
        console.log('[NextAuth signIn] Is admin?', isAdmin)

        try {
          const updateData: any = {
            name: user.name || undefined,
            image: user.image || undefined,
            emailVerified: new Date(),
          }

          if (isAdmin) {
            updateData.role = 'ADMIN'
          }

          const createData: any = {
            email: user.email,
            name: user.name || '',
            image: user.image || '',
            role: isAdmin ? 'ADMIN' : 'CLIENT',
            roles: isAdmin ? ['ADMIN'] : ['CLIENT'],
            emailVerified: new Date(),
          }

          console.log('[NextAuth signIn] Update data:', JSON.stringify(updateData))
          console.log('[NextAuth signIn] Create data:', JSON.stringify(createData))

          const upsertedUser = await prisma.user.upsert({
            where: { email: user.email },
            update: updateData,
            create: createData,
          })

          console.log('[NextAuth signIn] User upserted successfully:', upsertedUser.id, 'with role:', upsertedUser.role)
          return true
        } catch (upsertError) {
          console.error('[NextAuth signIn] Upsert failed:', upsertError)
          if (upsertError instanceof Error) {
            console.error('[NextAuth signIn] Upsert error message:', upsertError.message)
            console.error('[NextAuth signIn] Upsert error stack:', upsertError.stack)
          }
          throw upsertError
        }
      } catch (error) {
        console.error('[NextAuth signIn] Error occurred:', error)
        if (error instanceof Error) {
          console.error('[NextAuth signIn] Error message:', error.message)
          console.error('[NextAuth signIn] Error stack:', error.stack)
        }
        return false
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    async signOut() {
      // Log sign out if needed
    },
  },
}

console.log('[NextAuth CONFIG] Creating handler...')
const handler = NextAuth(authOptions)
console.log('[NextAuth CONFIG] Handler created successfully!')
export { handler as GET, handler as POST }
console.log('[NextAuth CONFIG] Exported handler as GET and POST')
