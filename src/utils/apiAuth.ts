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
      childId = authData.childId
    } catch {
      return {
        childId: null,
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const child = await ChildAuth.getChildProfile(childId)
    if (!child) {
      return {
        childId: null,
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    return { childId, error: null }
  } catch {
    return {
      childId: null,
      error: NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 })
    }
  }
}

export function createErrorResponse(message: string, status: number = 500): NextResponse {
  return NextResponse.json({ error: message }, { status })
}