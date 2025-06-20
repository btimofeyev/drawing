import { NextRequest, NextResponse } from 'next/server'
import { ChildAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get child auth cookie
    const cookieStore = cookies()
    const authCookie = cookieStore.get('child_auth')
    
    if (!authCookie?.value) {
      return NextResponse.json(
        { error: 'Unauthorized - No auth cookie' },
        { status: 401 }
      )
    }

    let childId: string
    try {
      const authData = JSON.parse(authCookie.value)
      childId = authData.childId
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid auth cookie' },
        { status: 401 }
      )
    }

    // Get child profile
    const child = await ChildAuth.getChildProfile(childId)
    if (!child) {
      return NextResponse.json(
        { error: 'Unauthorized - Child not found' },
        { status: 401 }
      )
    }

    // Fetch user stats
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('child_id', child.id)
      .single()

    if (statsError || !stats) {
      // Create initial stats if they don't exist
      const { data: newStats, error: createError } = await supabaseAdmin
        .from('user_stats')
        .insert({
          child_id: child.id,
          total_posts: 0,
          total_likes_received: 0,
          total_likes_given: 0,
          current_streak: 0,
          best_streak: 0,
          level: 1,
          total_points: 0
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json(
          { error: 'Failed to create user stats' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        stats: {
          totalPosts: newStats.total_posts,
          totalLikesReceived: newStats.total_likes_received,
          totalLikesGiven: newStats.total_likes_given,
          currentStreak: newStats.current_streak,
          bestStreak: newStats.best_streak,
          level: newStats.level,
          points: newStats.total_points,
          lastPostDate: newStats.last_post_date
        },
        child: {
          id: child.id,
          username: child.username,
          name: child.name,
          ageGroup: child.age_group
        }
      })
    }

    return NextResponse.json({
      stats: {
        totalPosts: stats.total_posts,
        totalLikesReceived: stats.total_likes_received,
        totalLikesGiven: stats.total_likes_given,
        currentStreak: stats.current_streak,
        bestStreak: stats.best_streak,
        level: stats.level,
        points: stats.total_points,
        lastPostDate: stats.last_post_date
      },
      child: {
        id: child.id,
        username: child.username,
        name: child.name,
        ageGroup: child.age_group
      }
    })
  } catch (error) {
    console.error('Child stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}