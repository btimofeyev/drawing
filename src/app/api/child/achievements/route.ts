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

    // Get child profile
    const child = await ChildAuth.getChildProfile(childId)
    if (!child) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all achievements
    const { data: allAchievements, error: achievementsError } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .order('points', { ascending: true })

    if (achievementsError) {
      return NextResponse.json(
        { error: 'Failed to fetch achievements' },
        { status: 500 }
      )
    }

    // Fetch user's earned achievements
    const { data: userAchievements, error: userAchievementsError } = await supabaseAdmin
      .from('user_achievements')
      .select('achievement_id, earned_at')
      .eq('child_id', child.id)

    if (userAchievementsError) {
      return NextResponse.json(
        { error: 'Failed to fetch user achievements' },
        { status: 500 }
      )
    }

    // Get user stats for progress calculation
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('child_id', child.id)
      .single()

    const earnedAchievementIds = new Set(userAchievements?.map(ua => ua.achievement_id) || [])

    // Process achievements with progress
    const processedAchievements = allAchievements?.map(achievement => {
      const isEarned = earnedAchievementIds.has(achievement.id)
      const progress = calculateProgress(achievement.criteria, stats)

      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        points: achievement.points,
        earned: isEarned,
        progress: progress.current,
        total: progress.total,
        earnedAt: userAchievements?.find(ua => ua.achievement_id === achievement.id)?.earned_at
      }
    }) || []

    return NextResponse.json({
      achievements: processedAchievements
    })
  } catch (error) {
    console.error('Achievements error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}

function calculateProgress(criteria: string, stats: any): { current: number; total: number } {
  if (!stats) return { current: 0, total: 1 }

  // Parse criteria format: "upload_count:5" or "likes_received:25"
  const [type, targetStr] = criteria.split(':')
  const target = parseInt(targetStr) || 1

  switch (type) {
    case 'upload_count':
      return { current: Math.min(stats.total_posts, target), total: target }
    case 'likes_received':
      return { current: Math.min(stats.total_likes_received, target), total: target }
    case 'likes_given':
      return { current: Math.min(stats.total_likes_given, target), total: target }
    case 'streak':
      return { current: Math.min(stats.best_streak, target), total: target }
    default:
      return { current: 0, total: target }
  }
}