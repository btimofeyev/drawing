import { NextRequest, NextResponse } from 'next/server'
import { ChildAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get child auth cookie
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('child_auth')
    
    if (!authCookie?.value) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let childId: string
    try {
      const authData = JSON.parse(authCookie.value)
      childId = authData.childId
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get child profile with parent info
    const { data: childData, error: childError } = await supabaseAdmin
      .from('child_profiles')
      .select(`
        id,
        username,
        name,
        age_group,
        created_at,
        parent_accounts (
          id,
          email
        )
      `)
      .eq('id', childId)
      .single()

    if (childError || !childData) {
      console.error('Failed to fetch child profile:', childError)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get user stats
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('child_id', childId)
      .single()

    const profile = {
      id: childData.id,
      username: childData.username,
      name: childData.name,
      ageGroup: childData.age_group,
      joinDate: childData.created_at,
      level: stats?.level || 1,
      totalPoints: stats?.total_points || 0
    }

    return NextResponse.json({
      success: true,
      profile
    })

  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}