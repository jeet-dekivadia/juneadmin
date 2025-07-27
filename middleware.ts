import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for admin session cookie
    const adminSession = request.cookies.get('june-admin-session')
    
    if (!adminSession || adminSession.value !== 'authenticated-junedating-2025') {
      // Redirect to login if no valid session
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
} 