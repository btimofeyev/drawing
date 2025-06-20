import { NextResponse } from 'next/server'

// Simple test endpoint to manually trigger prompt generation
export async function GET() {
  try {
    // Get tomorrow's date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Call the cron endpoint with the secret
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_URL 
      : 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/cron/generate-daily-prompts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`
      }
    })

    const result = await response.json()

    return NextResponse.json({
      message: 'Cron job triggered',
      date: tomorrowStr,
      result
    })
  } catch (error) {
    console.error('Error triggering cron:', error)
    return NextResponse.json(
      { error: 'Failed to trigger cron job' },
      { status: 500 }
    )
  }
}