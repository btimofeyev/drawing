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

    // Calculate start of current month
    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const monthStart = startOfMonth.toISOString()

    // Get monthly uploads leaderboard
    const { data: monthlyUploads, error: monthlyUploadsError } = await supabaseAdmin
      .from('posts')
      .select(`
        child_id,
        child_profiles!inner(username, name, age_group)
      `)
      .gte('created_at', monthStart)
      .eq('moderation_status', 'approved')

    // Get monthly likes leaderboard (total likes received across all posts this month)
    const { data: monthlyLikesData, error: monthlyLikesError } = await supabaseAdmin
      .from('child_likes')
      .select(`
        post_id,
        posts!inner(
          child_id,
          created_at,
          child_profiles!inner(username, name, age_group)
        )
      `)
      .gte('created_at', monthStart)

    // Get new artists (users created in last 30 days with posts)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { data: newArtistsData, error: newArtistsError } = await supabaseAdmin
      .from('child_profiles')
      .select(`
        id,
        username,
        name,
        age_group,
        created_at
      `)
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Get posts count for new artists
    const { data: newArtistsPosts, error: newArtistsPostsError } = await supabaseAdmin
      .from('posts')
      .select('child_id')
      .eq('moderation_status', 'approved')
      .in('child_id', newArtistsData?.map(artist => artist.id) || [])

    // Get growth data (compare this week vs last week upload counts)
    const lastWeekStart = new Date(startOfWeek)
    lastWeekStart.setDate(lastWeekStart.getDate() - 7)
    const lastWeekStartISO = lastWeekStart.toISOString()

    const { data: lastWeekUploads, error: lastWeekError } = await supabaseAdmin
      .from('posts')
      .select(`
        child_id,
        child_profiles!inner(username, name, age_group)
      `)
      .gte('created_at', lastWeekStartISO)
      .lt('created_at', weekStart)
      .eq('moderation_status', 'approved')

    // Process monthly uploads
    const monthlyUploadsMap = new Map<string, { child: any; count: number }>()
    monthlyUploads?.forEach(post => {
      const childId = post.child_id
      const childData = post.child_profiles
      
      if (monthlyUploadsMap.has(childId)) {
        monthlyUploadsMap.get(childId)!.count++
      } else {
        monthlyUploadsMap.set(childId, { child: childData, count: 1 })
      }
    })

    // Process monthly likes (total likes received on all posts, not just this month's posts)
    const monthlyLikesMap = new Map<string, { child: any; count: number }>()
    monthlyLikesData?.forEach(like => {
      const childId = Array.isArray(like.posts) ? like.posts[0]?.child_id : (like.posts as any)?.child_id
      const childData = Array.isArray(like.posts) ? like.posts[0]?.child_profiles : (like.posts as any)?.child_profiles
      
      if (monthlyLikesMap.has(childId)) {
        monthlyLikesMap.get(childId)!.count++
      } else {
        monthlyLikesMap.set(childId, { child: childData, count: 1 })
      }
    })

    // Process new artists
    const newArtistsMap = new Map<string, { child: any; count: number }>()
    newArtistsPosts?.forEach(post => {
      const childId = post.child_id
      const artistData = newArtistsData?.find(artist => artist.id === childId)
      
      if (artistData) {
        if (newArtistsMap.has(childId)) {
          newArtistsMap.get(childId)!.count++
        } else {
          newArtistsMap.set(childId, { 
            child: {
              username: artistData.username,
              name: artistData.name,
              age_group: artistData.age_group
            }, 
            count: 1 
          })
        }
      }
    })

    // Process growth comparison (this week vs last week)
    const thisWeekMap = new Map<string, { count: number; child: any }>()
    const lastWeekMap = new Map<string, number>()
    
    // Build this week's data with child info
    weeklyUploads?.forEach(post => {
      const childId = post.child_id
      const childData = post.child_profiles
      
      if (thisWeekMap.has(childId)) {
        thisWeekMap.get(childId)!.count++
      } else {
        thisWeekMap.set(childId, { count: 1, child: childData })
      }
    })
    
    // Build last week's data
    lastWeekUploads?.forEach(post => {
      const childId = post.child_id
      lastWeekMap.set(childId, (lastWeekMap.get(childId) || 0) + 1)
    })

    const growthMap = new Map<string, { child: any; growth: number; thisWeek: number; lastWeek: number }>()
    
    // Check growth for all users who posted this week
    thisWeekMap.forEach((thisWeekData, childId) => {
      const thisWeekCount = thisWeekData.count
      const lastWeekCount = lastWeekMap.get(childId) || 0
      const growth = thisWeekCount - lastWeekCount
      
      if (growth > 0) {  // Only show positive growth
        growthMap.set(childId, {
          child: thisWeekData.child,
          growth: growth,
          thisWeek: thisWeekCount,
          lastWeek: lastWeekCount
        })
      }
    })

    // Convert to sorted arrays
    const topMonthlyUploads = Array.from(monthlyUploadsMap.values())
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

    const topMonthlyLikes = Array.from(monthlyLikesMap.values())
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

    const topNewArtists = Array.from(newArtistsMap.values())
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

    const topGrowth = Array.from(growthMap.values())
      .sort((a, b) => b.growth - a.growth)
      .slice(0, 10)
      .map((item, index) => ({
        rank: index + 1,
        username: item.child.username,
        name: item.child.name,
        ageGroup: item.child.age_group,
        count: item.growth,
        isCurrentChild: item.child.username === child.username
      }))

    return NextResponse.json({
      leaderboards: {
        weeklyUploads: topUploaders,
        weeklyLikes: topLiked,
        currentStreaks: topStreaks,
        monthlyUploads: topMonthlyUploads,
        monthlyLikes: topMonthlyLikes,
        newArtists: topNewArtists,
        mostImproved: topGrowth,
        communityStars: topCommunity
      },
      weekStart: weekStart,
      monthStart: monthStart
    })
  } catch (error) {
    console.error('Leaderboards error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboards' },
      { status: 500 }
    )
  }
}