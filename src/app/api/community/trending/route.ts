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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type') || 'trending' // trending, popular, recent
    const ageGroup = searchParams.get('age_group') || child.age_group

    let orderClause: string
    switch (type) {
      case 'popular':
        orderClause = 'popularity_score.desc'
        break
      case 'recent':
        orderClause = 'created_at.desc'
        break
      default: // trending
        orderClause = 'trending_score.desc'
    }

    // Get trending prompts with community engagement
    const { data: trendingPrompts, error } = await supabaseAdmin
      .from('prompts')
      .select(`
        *,
        prompt_popularity!inner (
          total_posts,
          total_likes,
          popularity_score,
          trending_score
        )
      `)
      .eq('age_group', ageGroup)
      .in('prompt_type', ['shared_daily', 'community_remix'])
      .gt('prompt_popularity.total_posts', 0) // Only prompts with posts
      .order(orderClause, { foreignTable: 'prompt_popularity' })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch trending prompts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch trending prompts' },
        { status: 500 }
      )
    }

    // For each prompt, get a sample of recent artwork
    const enrichedPrompts = await Promise.all(
      (trendingPrompts || []).map(async (prompt) => {
        // Get 3 recent posts for preview
        const { data: samplePosts } = await supabaseAdmin
          .from('posts')
          .select(`
            id,
            image_url,
            thumbnail_url,
            child_profiles!inner (username, name, avatar_url)
          `)
          .eq('prompt_id', prompt.id)
          .eq('moderation_status', 'approved')
          .order('created_at', { ascending: false })
          .limit(3)

        // Check if user has posted for this prompt
        const { data: userPost } = await supabaseAdmin
          .from('posts')
          .select('id')
          .eq('prompt_id', prompt.id)
          .eq('child_id', childId)
          .single()

        // Parse prompt details
        const parsedTitle = extractTitleFromPromptText(prompt.prompt_text)
        const parsedEmoji = extractEmojiFromPromptText(prompt.prompt_text)

        return {
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
            totalPosts: prompt.prompt_popularity.total_posts,
            totalLikes: prompt.prompt_popularity.total_likes,
            popularityScore: prompt.prompt_popularity.popularity_score,
            trendingScore: prompt.prompt_popularity.trending_score
          },
          sampleArtwork: samplePosts?.map(post => ({
            id: post.id,
            imageUrl: post.image_url,
            thumbnailUrl: post.thumbnail_url,
            artist: {
              username: post.child_profiles.username,
              name: post.child_profiles.name,
              avatarUrl: post.child_profiles.avatar_url
            }
          })) || [],
          hasUserPosted: !!userPost,
          createdAt: prompt.created_at
        }
      })
    )

    return NextResponse.json({
      success: true,
      prompts: enrichedPrompts,
      meta: {
        type,
        ageGroup,
        limit,
        total: enrichedPrompts.length
      }
    })
  } catch (error) {
    console.error('Error in trending prompts API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
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