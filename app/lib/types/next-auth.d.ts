import { UserRole } from '@prisma/client'
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      roles: string[] // Array of roles
      role: string // Primary role for backward compatibility
      questionnaireCompleted: boolean
    }
  }

  interface User {
    id: string
    email: string
    roles: string[]
    role?: string // For backward compatibility
    questionnaireCompleted: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    roles: string[] // Array of roles
    role: string // Primary role for backward compatibility
    questionnaireCompleted: boolean
  }
}
