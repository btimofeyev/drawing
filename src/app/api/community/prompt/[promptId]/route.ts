import { NextRequest, NextResponse } from 'next/server'
import { ChildAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { promptId: string } }
) {
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

    const { promptId } = params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sort') || 'newest' // newest, popular, trending
    const offset = (page - 1) * limit

    // First, get the prompt details
    const { data: prompt, error: promptError } = await supabaseAdmin
      .from('prompts')
      .select(`
        *,
        prompt_popularity (
          total_posts,
          total_likes,
          popularity_score,
          trending_score
        )
      `)
      .eq('id', promptId)
      .single()

    if (promptError || !prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    // Build the order clause based on sortBy
    let orderBy: string
    switch (sortBy) {
      case 'popular':
        orderBy = 'likes_count.desc'
        break
      case 'trending':
        orderBy = 'created_at.desc' // For now, use recency as trending
        break
      case 'oldest':
        orderBy = 'created_at.asc'
        break
      default: // newest
        orderBy = 'created_at.desc'
    }

    // Get all approved posts for this prompt
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('posts')
      .select(`
        id,
        image_url,
        thumbnail_url,
        alt_text,
        created_at,
        likes_count,
        child_id,
        child_profiles!inner (
          username,
          name,
          avatar_url,
          age_group
        )
      `)
      .eq('prompt_id', promptId)
      .eq('moderation_status', 'approved')
      .order(orderBy)
      .range(offset, offset + limit - 1)

    if (postsError) {
      console.error('Failed to fetch community posts:', postsError)
      return NextResponse.json(
        { error: 'Failed to fetch community posts' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    const { count, error: countError } = await supabaseAdmin
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('prompt_id', promptId)
      .eq('moderation_status', 'approved')

    if (countError) {
      console.error('Failed to get posts count:', countError)
    }

    // Check which posts the current user has liked
    const postIds = posts?.map(p => p.id) || []
    const { data: userLikes } = await supabaseAdmin
      .from('child_likes')
      .select('post_id')
      .eq('child_id', childId)
      .in('post_id', postIds)

    const likedPostIds = new Set(userLikes?.map(like => like.post_id) || [])

    // Format the response
    const formattedPosts = posts?.map(post => ({
      id: post.id,
      imageUrl: post.image_url,
      thumbnailUrl: post.thumbnail_url,
      altText: post.alt_text,
      createdAt: post.created_at,
      likesCount: post.likes_count,
      isLiked: likedPostIds.has(post.id),
      isOwnPost: post.child_id === childId,
      artist: {
        username: post.child_profiles.username,
        name: post.child_profiles.name,
        avatarUrl: post.child_profiles.avatar_url,
        ageGroup: post.child_profiles.age_group
      }
    })) || []

    // Parse prompt details
    const parsedTitle = extractTitleFromPromptText(prompt.prompt_text)
    const parsedEmoji = extractEmojiFromPromptText(prompt.prompt_text)

    return NextResponse.json({
      success: true,
      prompt: {
        id: prompt.id,
        title: parsedTitle,
        description: prompt.prompt_text,
        communityTitle: prompt.community_title,
        emoji: parsedEmoji,
        difficulty: prompt.difficulty,
        ageGroup: prompt.age_group,
        date: prompt.date,
        promptType: prompt.prompt_type,
        stats: {
          totalPosts: prompt.prompt_popularity?.[0]?.total_posts || 0,
          totalLikes: prompt.prompt_popularity?.[0]?.total_likes || 0,
          popularityScore: prompt.prompt_popularity?.[0]?.popularity_score || 0,
          trendingScore: prompt.prompt_popularity?.[0]?.trending_score || 0
        }
      },
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: page < Math.ceil((count || 0) / limit),
        hasPrev: page > 1
      },
      filters: {
        sortBy,
        availableSorts: ['newest', 'popular', 'trending', 'oldest']
      }
    })
  } catch (error) {
    console.error('Error in community prompt API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions (same as in shared-daily route)
function extractTitleFromPromptText(promptText: string): string {
  const firstSentence = promptText.split('!')[0] || promptText.split('.')[0]
  
  if (firstSentence.length > 50) {
    const words = firstSentence.split(' ')
    return words.slice(0, 6).join(' ') + (words.length > 6 ? '...' : '')
  }
  
  return firstSentence
}

function extractEmojiFromPromptText(promptText: string): string {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
  const matches = promptText.match(emojiRegex)
  return matches ? matches[0] : '🎨'
}