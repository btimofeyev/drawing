import { NextRequest, NextResponse } from 'next/server'
import { ChildAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get child auth cookie for personalized data
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('child_auth')
    
    let currentChildId: string | null = null
    if (authCookie?.value) {
      try {
        const authData = JSON.parse(authCookie.value)
        currentChildId = authData.childId
      } catch (error) {
        // Invalid auth cookie, continue without personalization
      }
    }

    // Get query parameters
    const url = new URL(request.url)
    const timeSlot = url.searchParams.get('slot') as 'morning' | 'afternoon' | 'evening' | null
    const difficulty = url.searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | null
    const search = url.searchParams.get('search') || ''
    const sort = url.searchParams.get('sort') || 'newest'
    const dateFilter = url.searchParams.get('date') || 'all'
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Build base query
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
        child_profiles!inner(
          id,
          username,
          name,
          age_group
        ),
        prompts!inner(
          id,
          prompt_text,
          difficulty,
          time_slot
        )
      `)
      .eq('moderation_status', 'approved')

    // Apply time slot filter
    if (timeSlot) {
      query = query.eq('time_slot', timeSlot)
    }

    // Apply difficulty filter
    if (difficulty) {
      query = query.eq('prompts.difficulty', difficulty)
    }

    // Apply search filter
    if (search) {
      query = query.or(
        `alt_text.ilike.%${search}%,child_profiles.name.ilike.%${search}%,child_profiles.username.ilike.%${search}%,prompts.prompt_text.ilike.%${search}%`
      )
    }

    // Apply date filter
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0]
      query = query.gte('created_at', today)
    } else if (dateFilter === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      query = query.gte('created_at', weekAgo.toISOString())
    }

    // Apply sorting
    switch (sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'popular':
        // For now, we'll use created_at as proxy for popularity
        // Later can be replaced with actual likes count
        query = query.order('created_at', { ascending: false })
        break
      case 'trending':
        // Similar to popular for now
        query = query.order('created_at', { ascending: false })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: posts, error } = await query

    if (error) {
      console.error('Failed to fetch gallery posts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch gallery posts' },
        { status: 500 }
      )
    }

    // Transform data to match frontend interface
    const artworks = posts?.map(post => ({
      id: post.id,
      imageUrl: post.image_url,
      thumbnailUrl: post.thumbnail_url,
      altText: post.alt_text,
      artistName: post.child_profiles.name,
      artistUsername: post.child_profiles.username,
      likes: 0, // Placeholder - will be replaced with actual likes later
      createdAt: post.created_at,
      promptId: post.prompt_id,
      promptTitle: extractPromptTitle(post.prompts.prompt_text),
      promptDescription: post.prompts.prompt_text,
      timeSlot: post.time_slot,
      difficulty: post.prompts.difficulty,
      ageGroup: post.child_profiles.age_group,
      isLiked: false, // Placeholder - will be replaced with actual user likes later
      isOwnPost: currentChildId === post.child_profiles.id
    })) || []

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('moderation_status', 'approved')

    if (timeSlot) {
      countQuery = countQuery.eq('time_slot', timeSlot)
    }

    const { count } = await countQuery

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

// Helper function to extract a title from the prompt description
function extractPromptTitle(promptText: string): string {
  // Take first 3-4 words as title
  const words = promptText.split(' ').slice(0, 4)
  let title = words.join(' ')
  
  // Clean up common punctuation
  title = title.replace(/[.!?]$/, '')
  
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1)
  
  return title
}