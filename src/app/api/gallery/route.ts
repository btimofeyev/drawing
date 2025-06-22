import { NextRequest, NextResponse } from 'next/server'
import { ChildAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('child_auth')
    
    let currentChildId: string | null = null
    if (authCookie?.value) {
      try {
        const authData = JSON.parse(authCookie.value)
        currentChildId = authData.childId
      } catch {
        // Continue without personalization
      }
    }

    const url = new URL(request.url)
    const timeSlot = url.searchParams.get('slot') as 'daily_1' | 'daily_2' | 'free_draw' | null
    const difficulty = url.searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | null
    const search = url.searchParams.get('search') || ''
    const sort = url.searchParams.get('sort') || 'newest'
    const dateFilter = url.searchParams.get('date') || 'all'
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let query = supabaseAdmin
      .from('posts')
      .select(`
        id,
        image_url,
        thumbnail_url,
        alt_text,
        created_at,
        time_slot,
        prompt_id,
        likes_count,
        views_count,
        child_id,
        child_profiles!inner(
          id,
          username,
          name,
          age_group
        ),
        prompts(
          id,
          prompt_text,
          difficulty,
          time_slot
        )
      `)
      .eq('moderation_status', 'approved')

    if (timeSlot) {
      query = query.eq('time_slot', timeSlot)
    }

    if (difficulty) {
      query = query.eq('prompts.difficulty', difficulty)
    }

    if (search) {
      query = query.or(
        `alt_text.ilike.%${search}%,child_profiles.name.ilike.%${search}%,child_profiles.username.ilike.%${search}%,prompts.prompt_text.ilike.%${search}%`
      )
    }

    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0]
      query = query.gte('created_at', today)
    } else if (dateFilter === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      query = query.gte('created_at', weekAgo.toISOString())
    }

    const sortOrder = {
      oldest: { created_at: { ascending: true } },
      popular: { created_at: { ascending: false } },
      trending: { created_at: { ascending: false } },
      newest: { created_at: { ascending: false } }
    }[sort] || { created_at: { ascending: false } }
    
    query = query.order('created_at', sortOrder.created_at)

    query = query.range(offset, offset + limit - 1)

    const { data: posts, error } = await query

    if (error) {
      console.error('Failed to fetch gallery posts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch gallery posts' },
        { status: 500 }
      )
    }


    let userLikes = new Set<string>()
    if (currentChildId && posts?.length) {
      const postIds = posts.map(p => p.id)
      const { data: likes } = await supabaseAdmin
        .from('child_likes')
        .select('post_id')
        .eq('child_id', currentChildId)
        .in('post_id', postIds)
      
      userLikes = new Set(likes?.map(like => like.post_id) || [])
    }

    const artworks = posts?.map(post => {
      const profile = Array.isArray(post.child_profiles) ? post.child_profiles[0] : post.child_profiles
      const prompt = Array.isArray(post.prompts) ? post.prompts[0] : post.prompts
      
      return {
        id: post.id,
        imageUrl: post.image_url,
        thumbnailUrl: post.thumbnail_url,
        altText: post.alt_text,
        artistName: profile?.name,
        artistUsername: profile?.username,
        likes: post.likes_count || 0,
        views: post.views_count || 0,
        createdAt: post.created_at,
        promptId: post.prompt_id || null,
        promptTitle: post.time_slot === 'free_draw' ? 'Free Draw' : extractPromptTitle(prompt?.prompt_text),
        promptDescription: post.time_slot === 'free_draw' ? 'Free creative expression' : prompt?.prompt_text,
        timeSlot: post.time_slot,
        difficulty: post.time_slot === 'free_draw' ? 'easy' : prompt?.difficulty,
        ageGroup: profile?.age_group,
        isLiked: userLikes.has(post.id),
        isOwnPost: currentChildId === post.child_id
      }
    }) || []

    let countQuery = supabaseAdmin
      .from('posts')
      .select('id, child_profiles!inner(id)', { count: 'exact', head: true })
      .eq('moderation_status', 'approved')

    if (timeSlot) {
      countQuery = countQuery.eq('time_slot', timeSlot)
    }

    if (difficulty) {
      countQuery = countQuery.eq('prompts.difficulty', difficulty)
    }

    if (search) {
      countQuery = countQuery.or(
        `alt_text.ilike.%${search}%,child_profiles.name.ilike.%${search}%,child_profiles.username.ilike.%${search}%,prompts.prompt_text.ilike.%${search}%`
      )
    }

    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0]
      countQuery = countQuery.gte('created_at', today)
    } else if (dateFilter === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      countQuery = countQuery.gte('created_at', weekAgo.toISOString())
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Failed to fetch gallery count:', countError)
    }


    return NextResponse.json({
      artworks,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + artworks.length
      },
      filters: {
        timeSlot,
        difficulty,
        search,
        sort,
        dateFilter
      }
    })
  } catch (error) {
    console.error('Gallery error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    )
  }
}

function extractPromptTitle(promptText?: string): string {
  if (!promptText) return 'Challenge'
  
  const words = promptText.split(' ').slice(0, 4)
  let title = words.join(' ')
  
  title = title.replace(/[.!?]$/, '')
  title = title.charAt(0).toUpperCase() + title.slice(1)
  
  return title
}