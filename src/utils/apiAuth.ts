import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ChildAuth } from '@/lib/auth'

export interface AuthResult {
  childId: string | null
  error: NextResponse | null
}

export async function getAuthenticatedChild(_request: NextRequest): Promise<AuthResult> {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('child_auth')
    
    if (!authCookie?.value) {
      return {
        childId: null,
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    let childId: string
    try {
      const authData = JSON.parse(authCookie.value)
      
      // Validate required fields
      if (!authData.childId || !authData.username || !authData.expires) {
        return {
          childId: null,
          error: NextResponse.json({ error: 'Invalid session' }, { status: 401 })
        }
      }

      // Check if session has expired
      const expiresAt = new Date(authData.expires)
      if (expiresAt <= new Date()) {
        return {
          childId: null,
          error: NextResponse.json({ error: 'Session expired' }, { status: 401 })
        }
      }

      childId = authData.childId
    } catch {
      return {
        childId: null,
        error: NextResponse.json({ error: 'Invalid session format' }, { status: 401 })
      }
    }

    // Verify child still exists in database
    const child = await ChildAuth.getChildProfile(childId)
    if (!child) {
      return {
        childId: null,
        error: NextResponse.json({ error: 'User not found' }, { status: 401 })
      }
    }

    return { childId, error: null }
  } catch {
    return {
      childId: null,
      error: NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
    }
  }
}

export function createErrorResponse(message: string, status: number = 500): NextResponse {
  return NextResponse.json({ error: message }, { status })
}