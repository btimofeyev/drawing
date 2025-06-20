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

    // Calculate start of current week (Monday)
    const now = new Date()
    const startOfWeek = new Date(now)
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    startOfWeek.setDate(diff)
    startOfWeek.setHours(0, 0, 0, 0)

    const weekStart = startOfWeek.toISOString()

    // Get weekly uploads leaderboard
    const { data: weeklyUploads, error: uploadsError } = await supabaseAdmin
      .from('posts')
      .select(`
        child_id,
        child_profiles!inner(username, name, age_group)
      `)
      .gte('created_at', weekStart)
      .eq('moderation_status', 'approved')

    // Get weekly likes leaderboard (likes received)
    const { data: weeklyLikes, error: likesError } = await supabaseAdmin
      .from('child_likes')
      .select(`
        post_id,
        posts!inner(
          child_id,
          child_profiles!inner(username, name, age_group)
        )
      `)
      .gte('created_at', weekStart)

    // Get community stars leaderboard (likes given)
    const { data: communityData, error: communityError } = await supabaseAdmin
      .from('child_likes')
      .select(`
        child_id,
        child_profiles!inner(username, name, age_group)
      `)
      .gte('created_at', weekStart)

    if (uploadsError || likesError || communityError) {
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard data' },
        { status: 500 }
      )
    }

    // Process uploads data
    const uploadsMap = new Map<string, { child: any; count: number }>()
    weeklyUploads?.forEach(post => {
      const childId = post.child_id
      const childData = post.child_profiles
      
      if (uploadsMap.has(childId)) {
        uploadsMap.get(childId)!.count++
      } else {
        uploadsMap.set(childId, {
          child: childData,
          count: 1
        })
      }
    })

    // Process likes data (likes received)
    const likesMap = new Map<string, { child: any; count: number }>()
    weeklyLikes?.forEach(like => {
      const childId = Array.isArray(like.posts) ? like.posts[0]?.child_id : (like.posts as any)?.child_id
      const childData = Array.isArray(like.posts) ? like.posts[0]?.child_profiles : (like.posts as any)?.child_profiles
      
      if (likesMap.has(childId)) {
        likesMap.get(childId)!.count++
      } else {
        likesMap.set(childId, {
          child: childData,
          count: 1
        })
      }
    })

    // Process community data (likes given)
    const communityMap = new Map<string, { child: any; count: number }>()
    communityData?.forEach(like => {
      const childId = like.child_id
      const childData = like.child_profiles
      
      if (communityMap.has(childId)) {
        communityMap.get(childId)!.count++
      } else {
        communityMap.set(childId, {
          child: childData,
          count: 1
        })
      }
    })

    // Convert to arrays and sort
    const topUploaders = Array.from(uploadsMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item, index) => ({
        rank: index + 1,
        username: item.child.username,
        name: item.child.name,
        ageGroup: item.child.age_group,
        count: item.count,
        isCurrentChild: item.child.username === child.username
      }))

    const topLiked = Array.from(likesMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item, index) => ({
        rank: index + 1,
        username: item.child.username,
        name: item.child.name,
        ageGroup: item.child.age_group,
        count: item.count,
        isCurrentChild: item.child.username === child.username
      }))

    // Get current streaks leaderboard
    const { data: streaksData, error: streaksError } = await supabaseAdmin
      .from('user_stats')
      .select(`
        current_streak,
        child_profiles!inner(username, name, age_group)
      `)
      .gt('current_streak', 0)
      .order('current_streak', { ascending: false })
      .limit(10)

    const topStreaks = streaksData?.map((item, index) => ({
      rank: index + 1,
      username: Array.isArray(item.child_profiles) ? item.child_profiles[0]?.username : (item.child_profiles as any)?.username,
      name: Array.isArray(item.child_profiles) ? item.child_profiles[0]?.name : (item.child_profiles as any)?.name,
      ageGroup: Array.isArray(item.child_profiles) ? item.child_profiles[0]?.age_group : (item.child_profiles as any)?.age_group,
      count: item.current_streak,
      isCurrentChild: (Array.isArray(item.child_profiles) ? item.child_profiles[0]?.username : (item.child_profiles as any)?.username) === child.username
    })) || []

    const topCommunity = Array.from(communityMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item, index) => ({
        rank: index + 1,
        username: item.child.username,
        name: item.child.name,
        ageGroup: item.child.age_group,
        count: item.count,
        isCurrentChild: item.child.username === child.username
      }))

    return NextResponse.json({
      leaderboards: {
        weeklyUploads: topUploaders,
        weeklyLikes: topLiked,
        currentStreaks: topStreaks,
        monthlyUploads: [], // Placeholder for now
        monthlyLikes: [], // Placeholder for now
        newArtists: [], // Placeholder for now
        mostImproved: [], // Placeholder for now
        communityStars: topCommunity
      },
      weekStart: weekStart
    })
  } catch (error) {
    console.error('Leaderboards error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboards' },
      { status: 500 }
    )
  }
}