import { supabaseAdmin } from './supabase'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// List of admin email addresses
const ADMIN_EMAILS = [
  'btimofeyev@gmail.com',
  // Add other admin emails here as needed
]

export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    // Get the user's email from auth.users
    const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (error || !user?.user || !user.user.email) {
      return false
    }
    
    // Check if the email is in the admin list
    return ADMIN_EMAILS.includes(user.user.email.toLowerCase())
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function requireAdminAuth() {
  try {
    // Check parent auth cookie
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('parent_auth')
    
    if (!authCookie?.value) {
      return {
        isAdmin: false,
        error: NextResponse.json({ error: 'Unauthorized - No auth cookie' }, { status: 401 })
      }
    }
    
    // Parse and validate cookie
    let userId: string
    let authData: any
    try {
      authData = JSON.parse(authCookie.value)
      
      // Validate required fields
      if (!authData.userId || !authData.email || !authData.expires) {
        return {
          isAdmin: false,
          error: NextResponse.json({ error: 'Invalid session' }, { status: 401 })
        }
      }
      
      // Check if session has expired
      const expiresAt = new Date(authData.expires)
      if (expiresAt <= new Date()) {
        return {
          isAdmin: false,
          error: NextResponse.json({ error: 'Session expired' }, { status: 401 })
        }
      }
      
      userId = authData.userId
    } catch {
      return {
        isAdmin: false,
        error: NextResponse.json({ error: 'Invalid session format' }, { status: 401 })
      }
    }
    
    // Check if user is admin - first try by userId, then fallback to email from cookie
    let isAdmin = await isUserAdmin(userId)
    
    // If that fails, check if the email in the cookie is in the admin list as fallback
    if (!isAdmin && authData.email) {
      isAdmin = ADMIN_EMAILS.includes(authData.email.toLowerCase())
    }
    
    if (!isAdmin) {
      return {
        isAdmin: false,
        error: NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
      }
    }
    
    return { isAdmin: true, userId, error: null }
  } catch (error) {
    console.error('Admin auth error:', error)
    return {
      isAdmin: false,
      error: NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
    }
  }
}