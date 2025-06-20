import { NextRequest, NextResponse } from 'next/server'
import { ParentAuth } from '@/lib/auth'
import { z } from 'zod'

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = verifySchema.parse(body)

    // Verify the OTP code
    const data = await ParentAuth.verifyOtpCode(email, code)
    
    if (!data.user) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 400 }
      )
    }

    // Check if parent account exists, create if not
    let parent = await ParentAuth.getParentAccount(data.user.id)
    if (!parent && data.user.email) {
      try {
        await ParentAuth.createParentAccount(data.user.id, data.user.email)
      } catch (error) {
        console.error('Failed to create parent account:', error)
        // Continue anyway, might already exist
      }
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email
      },
      session: data.session
    })

    // Set the parent auth cookie that middleware expects
    response.cookies.set('parent_auth', JSON.stringify({
      userId: data.user.id,
      email: data.user.email,
      timestamp: Date.now()
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Parent verify error:', error)
    return NextResponse.json(
      { error: 'Invalid or expired code' },
      { status: 400 }
    )
  }
}