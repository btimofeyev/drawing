import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ageGroup = searchParams.get('ageGroup') as 'kids' | 'tweens' | null
    const category = searchParams.get('category')
    const count = parseInt(searchParams.get('count') || '1')

    if (!ageGroup || !['kids', 'tweens'].includes(ageGroup)) {
      return NextResponse.json({ error: 'Valid ageGroup is required' }, { status: 400 })
    }

    if (count < 1 || count > 10) {
      return NextResponse.json({ error: 'Count must be between 1 and 10' }, { status: 400 })
    }

    // Build query
    let query = supabaseAdmin
      .from('free_draw_inspirations')
      .select('suggestion, emoji, category')
      .eq('age_group', ageGroup)

    // Add category filter if specified
    if (category && ['animals', 'nature', 'fantasy', 'objects', 'emotions', 'activities'].includes(category)) {
      query = query.eq('category', category)
    }

    // Get random inspirations
    const { data: inspirations, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching free draw inspirations:', error)
      return NextResponse.json({ error: 'Failed to fetch inspirations' }, { status: 500 })
    }

    if (!inspirations || inspirations.length === 0) {
      // Fallback inspirations if database is empty
      const fallbackInspirations = getFallbackInspirations(ageGroup)
      return NextResponse.json({ 
        inspirations: fallbackInspirations.slice(0, count)
      })
    }

    // Randomly select inspirations
    const shuffled = inspirations.sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, count)

    return NextResponse.json({ 
      inspirations: selected
    })

  } catch (error) {
    console.error('Error in free draw inspiration API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getFallbackInspirations(ageGroup: 'kids' | 'tweens') {
  const fallbacks = {
    kids: [
      { suggestion: 'Your favorite animal wearing a funny hat', emoji: '🐶', category: 'animals' },
      { suggestion: 'A magical rainbow over your house', emoji: '🌈', category: 'nature' },
      { suggestion: 'Your dream playground', emoji: '🛝', category: 'fantasy' },
      { suggestion: 'A robot helper doing chores', emoji: '🤖', category: 'objects' },
      { suggestion: 'What happiness looks like to you', emoji: '😊', category: 'emotions' },
      { suggestion: 'Your favorite sport or game', emoji: '⚽', category: 'activities' },
    ],
    tweens: [
      { suggestion: 'An animal in an unexpected environment', emoji: '🦋', category: 'animals' },
      { suggestion: 'Your ideal eco-friendly city', emoji: '🌿', category: 'nature' },
      { suggestion: 'Your own fantasy world with unique rules', emoji: '🔮', category: 'fantasy' },
      { suggestion: 'Technology from 100 years in the future', emoji: '🚀', category: 'objects' },
      { suggestion: 'What growing up feels like', emoji: '🌱', category: 'emotions' },
      { suggestion: 'Your ideal career in action', emoji: '💼', category: 'activities' },
    ]
  }

  return fallbacks[ageGroup]
}