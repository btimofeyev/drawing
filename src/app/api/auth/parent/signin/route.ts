import { NextRequest, NextResponse } from 'next/server'
import { ParentAuth } from '@/lib/auth'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = signInSchema.parse(body)

    await ParentAuth.sendOtpCode(email)

    return NextResponse.json({
      success: true,
      message: 'Access code sent to your email'
    })
  } catch (error) {
    console.error('Parent signin error:', error)
    return NextResponse.json(
      { error: 'Failed to send access code' },
      { status: 400 }
    )
  }
}