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

    // Get user stats for progress calculation
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('child_id', child.id)
      .single()

    // Get user's posts for additional calculations
    const { data: userPosts, error: postsError } = await supabaseAdmin
      .from('posts')
      .select('id, created_at, time_slot, likes_count, views_count')
      .eq('child_id', child.id)
      .eq('moderation_status', 'approved')

    // Get user's likes given
    const { data: likesGiven, error: likesGivenError } = await supabaseAdmin
      .from('child_likes')
      .select('id')
      .eq('child_id', child.id)

    // Define comprehensive achievements with real progress calculation
    const achievementDefinitions = [
      // ===== CREATION ACHIEVEMENTS =====
      {
        id: 'create_1',
        name: 'First Steps',
        description: 'Upload your very first artwork!',
        criteria: 'posts',
        target: 1,
        points: 50
      },
      {
        id: 'create_2',
        name: 'Creative Explorer',
        description: 'Upload 5 amazing artworks',
        criteria: 'posts',
        target: 5,
        points: 150
      },
      {
        id: 'create_3',
        name: 'Prolific Artist',
        description: 'Upload 10 incredible pieces',
        criteria: 'posts',
        target: 10,
        points: 300
      },
      {
        id: 'create_4',
        name: 'Art Master',
        description: 'Upload 25 incredible artworks',
        criteria: 'posts',
        target: 25,
        points: 750
      },
      {
        id: 'create_5',
        name: 'Gallery Curator',
        description: 'Upload 50 masterpieces',
        criteria: 'posts',
        target: 50,
        points: 1500
      },
      {
        id: 'create_6',
        name: 'Gallery Legend',
        description: 'Upload 100 legendary artworks',
        criteria: 'posts',
        target: 100,
        points: 3000
      },

      // ===== SOCIAL ACHIEVEMENTS =====
      {
        id: 'social_1',
        name: 'Supporter',
        description: 'Give your first like to another artist',
        criteria: 'likes_given',
        target: 1,
        points: 25
      },
      {
        id: 'social_2',
        name: 'Community Spirit',
        description: 'Give 25 likes to support other artists',
        criteria: 'likes_given',
        target: 25,
        points: 200
      },
      {
        id: 'social_3',
        name: 'Art Encourager',
        description: 'Give 100 likes to fellow artists',
        criteria: 'likes_given',
        target: 100,
        points: 500
      },
      {
        id: 'social_4',
        name: 'First Fan',
        description: 'Receive your first like!',
        criteria: 'likes_received',
        target: 1,
        points: 50
      },
      {
        id: 'social_5',
        name: 'Rising Star',
        description: 'Receive 10 likes on your artwork',
        criteria: 'likes_received',
        target: 10,
        points: 150
      },
      {
        id: 'social_6',
        name: 'Art Lover',
        description: 'Receive 50 likes on your artwork',
        criteria: 'likes_received',
        target: 50,
        points: 400
      },
      {
        id: 'social_7',
        name: 'Popular Artist',
        description: 'Receive 200 likes across all artwork',
        criteria: 'likes_received',
        target: 200,
        points: 800
      },
      {
        id: 'social_8',
        name: 'Inspiration Machine',
        description: 'Receive 500 likes across all your artwork',
        criteria: 'likes_received',
        target: 500,
        points: 2000
      },

      // ===== STREAK ACHIEVEMENTS =====
      {
        id: 'streak_1',
        name: 'Daily Artist',
        description: 'Create art for 3 days in a row',
        criteria: 'current_streak',
        target: 3,
        points: 100
      },
      {
        id: 'streak_2',
        name: 'Week Warrior',
        description: 'Create art for 7 days straight',
        criteria: 'current_streak',
        target: 7,
        points: 300
      },
      {
        id: 'streak_3',
        name: 'Two Week Champion',
        description: 'Create art for 14 days in a row',
        criteria: 'best_streak',
        target: 14,
        points: 600
      },
      {
        id: 'streak_4',
        name: 'Unstoppable Creator',
        description: 'Create art for 30 days in a row',
        criteria: 'best_streak',
        target: 30,
        points: 1500
      },
      {
        id: 'streak_5',
        name: 'Art Machine',
        description: 'Create art for 100 days total',
        criteria: 'posts',
        target: 100,
        points: 2500
      },

      // ===== SKILL ACHIEVEMENTS =====
      {
        id: 'skill_1',
        name: 'Morning Person',
        description: 'Complete 5 morning challenges',
        criteria: 'morning_posts',
        target: 5,
        points: 150
      },
      {
        id: 'skill_2',
        name: 'Afternoon Artist',
        description: 'Complete 5 afternoon challenges',
        criteria: 'afternoon_posts',
        target: 5,
        points: 150
      },
      {
        id: 'skill_3',
        name: 'Night Owl',
        description: 'Complete 5 evening challenges',
        criteria: 'evening_posts',
        target: 5,
        points: 150
      },
      {
        id: 'skill_4',
        name: 'Triple Threat',
        description: 'Complete all 3 challenges in a single day',
        criteria: 'triple_day',
        target: 1,
        points: 500
      },
      {
        id: 'skill_5',
        name: 'Dawn Master',
        description: 'Complete 25 morning challenges',
        criteria: 'morning_posts',
        target: 25,
        points: 400
      },
      {
        id: 'skill_6',
        name: 'Midday Marvel',
        description: 'Complete 25 afternoon challenges',
        criteria: 'afternoon_posts',
        target: 25,
        points: 400
      },
      {
        id: 'skill_7',
        name: 'Twilight Virtuoso',
        description: 'Complete 25 evening challenges',
        criteria: 'evening_posts',
        target: 25,
        points: 400
      },
      {
        id: 'skill_8',
        name: 'Challenge Conqueror',
        description: 'Complete 100 challenges total',
        criteria: 'posts',
        target: 100,
        points: 1000
      },

      // ===== SPECIAL ACHIEVEMENTS =====
      {
        id: 'special_1',
        name: 'Welcome Aboard!',
        description: 'Join the Daily Scribble community',
        criteria: 'posts',
        target: 1,
        points: 100
      },
      {
        id: 'special_2',
        name: 'First View',
        description: 'Have someone view your artwork',
        criteria: 'views_received',
        target: 1,
        points: 50
      },
      {
        id: 'special_3',
        name: 'Trending Artist',
        description: 'Have your art viewed 100 times',
        criteria: 'views_received',
        target: 100,
        points: 300
      },
      {
        id: 'special_4',
        name: 'Viral Creator',
        description: 'Have your art viewed 500 times',
        criteria: 'views_received',
        target: 500,
        points: 800
      },
      {
        id: 'special_5',
        name: 'Gallery Superstar',
        description: 'Have your art viewed 1000 times',
        criteria: 'views_received',
        target: 1000,
        points: 2000
      },
      {
        id: 'special_6',
        name: 'Level Up!',
        description: 'Reach level 5',
        criteria: 'level',
        target: 5,
        points: 250
      },
      {
        id: 'special_7',
        name: 'Art Prodigy',
        description: 'Reach level 10',
        criteria: 'level',
        target: 10,
        points: 750
      },
      {
        id: 'special_8',
        name: 'Master Artist',
        description: 'Reach level 20',
        criteria: 'level',
        target: 20,
        points: 1500
      },
      {
        id: 'special_9',
        name: 'Weekend Warrior',
        description: 'Create art on both Saturday and Sunday',
        criteria: 'weekend_posts',
        target: 2,
        points: 200
      },
      {
        id: 'special_10',
        name: 'Early Bird',
        description: 'Upload art before 8 AM',
        criteria: 'early_posts',
        target: 1,
        points: 150
      },
      {
        id: 'special_11',
        name: 'Night Creator',
        description: 'Upload art after 10 PM',
        criteria: 'night_posts',
        target: 1,
        points: 150
      },
      {
        id: 'special_12',
        name: 'Birthday Artist',
        description: 'Create art on your birthday',
        criteria: 'birthday_posts',
        target: 1,
        points: 500
      }
    ]

    // Calculate current progress for each achievement
    const processedAchievements = achievementDefinitions.map(achievement => {
      const progress = calculateAchievementProgress(achievement.criteria, achievement.target, {
        stats,
        userPosts: userPosts || [],
        likesGiven: likesGiven || [],
        child
      })

      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        points: achievement.points,
        earned: progress.current >= achievement.target,
        progress: progress.current,
        total: achievement.target,
        earnedAt: progress.current >= achievement.target ? new Date().toISOString() : null
      }
    })

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

function calculateAchievementProgress(criteria: string, target: number, data: any): { current: number; total: number } {
  const { stats, userPosts, likesGiven, child } = data

  switch (criteria) {
    case 'posts':
      return { current: Math.min(userPosts.length, target), total: target }
    
    case 'likes_given':
      return { current: Math.min(likesGiven.length, target), total: target }
    
    case 'likes_received':
      const totalLikesReceived = userPosts.reduce((sum: number, post: any) => sum + (post.likes_count || 0), 0)
      return { current: Math.min(totalLikesReceived, target), total: target }
    
    case 'views_received':
      const totalViewsReceived = userPosts.reduce((sum: number, post: any) => sum + (post.views_count || 0), 0)
      return { current: Math.min(totalViewsReceived, target), total: target }
    
    case 'current_streak':
      return { current: Math.min(stats?.current_streak || 0, target), total: target }
    
    case 'best_streak':
      return { current: Math.min(stats?.best_streak || 0, target), total: target }
    
    case 'morning_posts':
      const morningPosts = userPosts.filter((post: any) => post.time_slot === 'morning').length
      return { current: Math.min(morningPosts, target), total: target }
    
    case 'afternoon_posts':
      const afternoonPosts = userPosts.filter((post: any) => post.time_slot === 'afternoon').length
      return { current: Math.min(afternoonPosts, target), total: target }
    
    case 'evening_posts':
      const eveningPosts = userPosts.filter((post: any) => post.time_slot === 'evening').length
      return { current: Math.min(eveningPosts, target), total: target }
    
    case 'triple_day':
      // Check if user has posted in all three time slots on the same day
      const postsByDate = userPosts.reduce((acc: any, post: any) => {
        const date = new Date(post.created_at).toDateString()
        if (!acc[date]) acc[date] = new Set()
        acc[date].add(post.time_slot)
        return acc
      }, {})
      
      const tripleDays = Object.values(postsByDate).filter((slots: any) => slots.size === 3).length
      return { current: Math.min(tripleDays, target), total: target }
    
    case 'level':
      // Calculate level based on total points (example: 100 points per level)
      const totalPoints = stats?.points || 0
      const currentLevel = Math.floor(totalPoints / 100) + 1
      return { current: Math.min(currentLevel, target), total: target }
    
    case 'weekend_posts':
      const weekendPosts = userPosts.filter((post: any) => {
        const dayOfWeek = new Date(post.created_at).getDay()
        return dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
      }).length
      return { current: Math.min(weekendPosts, target), total: target }
    
    case 'early_posts':
      const earlyPosts = userPosts.filter((post: any) => {
        const hour = new Date(post.created_at).getHours()
        return hour < 8
      }).length
      return { current: Math.min(earlyPosts, target), total: target }
    
    case 'night_posts':
      const nightPosts = userPosts.filter((post: any) => {
        const hour = new Date(post.created_at).getHours()
        return hour >= 22
      }).length
      return { current: Math.min(nightPosts, target), total: target }
    
    case 'birthday_posts':
      // This would need the child's birthday in the database
      // For now, return 0 as we don't have birthday data
      return { current: 0, total: target }
    
    default:
      return { current: 0, total: target }
  }
}