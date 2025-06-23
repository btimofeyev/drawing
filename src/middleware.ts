import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected parent routes (includes admin routes)
  const parentRoutes = ['/parent', '/admin']
  const childRoutes = ['/child-home', '/child']

  // Check for parent authentication
  if (parentRoutes.some(route => pathname.startsWith(route))) {
    const parentAuth = request.cookies.get('parent_auth')
    
    if (!parentAuth?.value) {
      return NextResponse.redirect(new URL('/auth/parent', request.url))
    }

    // Validate parent cookie structure
    try {
      const authData = JSON.parse(parentAuth.value)
      if (!authData.userId || !authData.email || !authData.expires) {
        return NextResponse.redirect(new URL('/auth/parent', request.url))
      }

      // Check if session has expired
      const expiresAt = new Date(authData.expires)
      if (expiresAt <= new Date()) {
        // Clear expired cookie and redirect
        const response = NextResponse.redirect(new URL('/auth/parent', request.url))
        response.cookies.delete('parent_auth')
        return response
      }
    } catch (error) {
      // Invalid cookie format, clear and redirect
      const response = NextResponse.redirect(new URL('/auth/parent', request.url))
      response.cookies.delete('parent_auth')
      return response
    }
  }

  // Check for child authentication
  if (childRoutes.some(route => pathname.startsWith(route))) {
    const childAuth = request.cookies.get('child_auth')
    
    if (!childAuth?.value) {
      return NextResponse.redirect(new URL('/auth/child', request.url))
    }

    // Validate child cookie structure
    try {
      const authData = JSON.parse(childAuth.value)
      if (!authData.childId || !authData.username || !authData.expires) {
        return NextResponse.redirect(new URL('/auth/child', request.url))
      }

      // Check if session has expired
      const expiresAt = new Date(authData.expires)
      if (expiresAt <= new Date()) {
        // Clear expired cookie and redirect
        const response = NextResponse.redirect(new URL('/auth/child', request.url))
        response.cookies.delete('child_auth')
        return response
      }
    } catch (error) {
      // Invalid cookie format, clear and redirect
      const response = NextResponse.redirect(new URL('/auth/child', request.url))
      response.cookies.delete('child_auth')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/parent/:path*', '/child-home/:path*', '/child/:path*', '/admin/:path*']
}