import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get all child profiles that have parental consent (for public listing)
    const { data: children, error } = await supabase
      .from('child_profiles')
      .select('id, name, avatar_url')
      .eq('parental_consent', true)
      .order('name')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch children' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      children: children.map(child => ({
        id: child.id,
        name: child.name,
        avatarUrl: child.avatar_url
      }))
    })
  } catch (error) {
    console.error('Get children list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch children' },
      { status: 500 }
    )
  }
}