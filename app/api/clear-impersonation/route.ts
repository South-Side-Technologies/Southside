import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()

  // Delete all impersonation cookies
  cookieStore.delete('impersonate_user_data')
  cookieStore.delete('impersonate_user_sub')
  cookieStore.delete('impersonate_original_sub')

  // Redirect to home page
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'))
}
