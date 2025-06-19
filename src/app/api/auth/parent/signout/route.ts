import { NextRequest, NextResponse } from 'next/server'
import { ParentAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await ParentAuth.signOut()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Parent signout error:', error)
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 400 }
    )
  }
}