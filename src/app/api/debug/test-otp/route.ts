import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    // Test the exact same code as your auth endpoint
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true
      }
    })

    return NextResponse.json({
      success: !error,
      error: error ? {
        message: error.message,
        status: error.status,
        details: error
      } : null,
      data: data ? 'OTP sent successfully' : null
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error
    }, { status: 500 })
  }
}