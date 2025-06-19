import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected parent routes
  const parentRoutes = ['/parent']
  const childRoutes = ['/child-home', '/child']

  // Check for parent authentication
  if (parentRoutes.some(route => pathname.startsWith(route))) {
    const parentAuth = request.cookies.get('parent_auth')
    
    if (!parentAuth) {
      return NextResponse.redirect(new URL('/auth/parent', request.url))
    }
  }

  // Check for child authentication
  if (childRoutes.some(route => pathname.startsWith(route))) {
    const childAuth = request.cookies.get('child_auth')
    
    if (!childAuth) {
      return NextResponse.redirect(new URL('/auth/child', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/parent/:path*', '/child-home/:path*', '/child/:path*']
}