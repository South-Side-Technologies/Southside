import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

/**
 * Middleware for route protection with NextAuth
 * Protects routes based on user role (ADMIN, CONTRACTOR, CLIENT)
 */
export default withAuth(
  function middleware(request) {
    const { pathname } = request.nextUrl
    const token = request.nextauth.token

    // If no token, withAuth will redirect to login with callback URL to return after auth
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }

    // Extract user role from token
    const userRole = token.role as 'ADMIN' | 'CONTRACTOR' | 'CLIENT' | undefined

    // Protect /admin routes - require ADMIN role
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    // Protect /contractor routes - allow anyone authenticated (onboarding, dashboard, etc.)
    // The /contractor/page.tsx handles role-based logic internally
    // - If already a contractor, redirects to /contractor/dashboard
    // - If not a contractor, shows onboarding form
    // So we don't need to check roles here

    // Protect /dashboard and /customer-login routes - require CLIENT or ADMIN role
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/customer-login')) {
      if (userRole !== 'CLIENT' && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Only require token to exist - role-specific checks are done in middleware function above
        return !!token
      },
    },
    pages: {
      signIn: '/login',
      error: '/error',
    },
  }
)

/**
 * Configure which routes the middleware runs on
 * Uses Next.js matcher for efficient route matching
 */
export const config = {
  matcher: [
    // Protected page routes
    '/dashboard/:path*',
    '/customer-login',
    '/questionnaire',
    '/register',

    // Admin routes
    '/admin/:path*',

    // Contractor routes
    '/contractor/:path*',

    // API routes that require authentication
    '/api/dashboard/:path*',
    '/api/admin/:path*',
    '/api/contractor/:path*',
    '/api/submit-questionnaire',
  ],
}
