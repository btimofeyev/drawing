import { NextRequest, NextResponse } from 'next/server'
import { ChildAuth, SessionManager } from '@/lib/auth'
import { z } from 'zod'

const childSignInSchema = z.object({
  username: z.string().min(3).max(20),
  pin: z.string().length(4).regex(/^\d+$/)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, pin } = childSignInSchema.parse(body)

    const child = await ChildAuth.authenticateChildByUsername(username, pin)
    
    if (!child) {
      return NextResponse.json(
        { error: 'Invalid username or PIN' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      child: {
        id: child.id,
        username: child.username,
        name: child.name,
        ageGroup: child.age_group,
        avatarUrl: child.avatar_url,
        parentalConsent: child.parental_consent
      }
    })

    SessionManager.setChildSession(child.id, response)
    
    return response
  } catch (error) {
    console.error('Child signin error:', error)
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 400 }
    )
  }
}