import { NextRequest, NextResponse } from 'next/server'
import { SessionManager } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true })
    SessionManager.clearChildSession(response)
    
    return response
  } catch (error) {
    console.error('Child signout error:', error)
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 400 }
    )
  }
}