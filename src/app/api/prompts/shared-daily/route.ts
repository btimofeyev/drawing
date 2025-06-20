import { NextRequest, NextResponse } from 'next/server'
import { ChildAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { PromptGenerator } from '@/lib/openai'
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    // Try to get shared daily prompt for this date and age group
    // Handle case where new columns don't exist yet
    let sharedPrompt = null
    let error = null
    
    try {
      const { data, error: queryError } = await supabaseAdmin
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
        .eq('date', date)
        .eq('age_group', child.age_group)
        .eq('prompt_type', 'shared_daily')
        .single()
      
      sharedPrompt = data
      error = queryError
    } catch (e) {
      // If the query fails (likely due to missing columns), fall back to basic query
      
      const { data, error: fallbackError } = await supabaseAdmin
        .from('prompts')
        .select('*')
        .eq('date', date)
        .eq('age_group', child.age_group)
        .limit(1)
        .single()
      
      sharedPrompt = data
      error = fallbackError
    }

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to fetch shared daily prompt:', error)
      return NextResponse.json(
        { error: 'Failed to fetch shared daily prompt' },
        { status: 500 }
      )
    }

    // If no shared prompt exists for today, generate one
    if (!sharedPrompt) {
      try {
        
        const generatedPrompt = await PromptGenerator.generateSharedDailyPrompt({
          ageGroup: child.age_group,
          difficulty: 'easy'
        })

        // Store the generated prompt in database
        let newPrompt = null
        let insertError = null
        
        try {
          const { data, error } = await supabaseAdmin
            .from('prompts')
            .insert({
              date,
              age_group: child.age_group,
              difficulty: generatedPrompt.difficulty,
              prompt_text: generatedPrompt.description,
              prompt_type: 'shared_daily',
              community_title: generatedPrompt.communityTitle
            })
            .select(`
              *,
              prompt_popularity (
                total_posts,
                total_likes,
                popularity_score,
                trending_score
              )
            `)
            .single()
          
          newPrompt = data
          insertError = error
        } catch (e) {
          // Fall back to basic insert without new columns
          
          const { data, error } = await supabaseAdmin
            .from('prompts')
            .insert({
              date,
              age_group: child.age_group,
              difficulty: generatedPrompt.difficulty,
              prompt_text: generatedPrompt.description
            })
            .select('*')
            .single()
          
          newPrompt = data
          insertError = error
        }

        if (insertError) {
          console.error('Failed to store shared daily prompt:', insertError)
          throw insertError
        }

        // Try to initialize popularity record (only if table exists)
        try {
          await supabaseAdmin
            .from('prompt_popularity')
            .insert({
              prompt_id: newPrompt.id,
              total_posts: 0,
              total_likes: 0,
              popularity_score: 0,
              trending_score: 0
            })
        } catch (e) {
        }

        return NextResponse.json({
          success: true,
          prompt: {
            id: newPrompt.id,
            title: generatedPrompt.title,
            description: newPrompt.prompt_text,
            communityTitle: newPrompt.community_title || generatedPrompt.communityTitle,
            emoji: generatedPrompt.emoji,
            difficulty: newPrompt.difficulty,
            ageGroup: newPrompt.age_group,
            date: newPrompt.date,
            isToday: date === new Date().toISOString().split('T')[0],
            promptType: 'shared_daily',
            stats: {
              totalPosts: 0,
              totalLikes: 0,
              popularityScore: 0,
              trendingScore: 0
            }
          }
        })
      } catch (error) {
        console.error('Failed to generate shared daily prompt:', error)
        
        // Return fallback prompt
        const fallbackPrompt = PromptGenerator.getFallbackSharedPrompt({
          ageGroup: child.age_group,
          difficulty: 'medium'
        })
        
        return NextResponse.json({
          success: true,
          prompt: {
            id: 'fallback',
            title: fallbackPrompt.title,
            description: fallbackPrompt.description,
            communityTitle: fallbackPrompt.communityTitle,
            emoji: fallbackPrompt.emoji,
            difficulty: fallbackPrompt.difficulty,
            ageGroup: fallbackPrompt.ageGroup,
            date,
            isToday: date === new Date().toISOString().split('T')[0],
            promptType: 'shared_daily',
            stats: {
              totalPosts: 0,
              totalLikes: 0,
              popularityScore: 0,
              trendingScore: 0
            }
          }
        })
      }
    }

    // Check if user has uploaded for this shared prompt
    const { data: userPost } = await supabaseAdmin
      .from('posts')
      .select('id, image_url, thumbnail_url, created_at, likes_count, moderation_status')
      .eq('child_id', childId)
      .eq('prompt_id', sharedPrompt.id)
      .single()

    // Parse the prompt for frontend
    const parsedTitle = extractTitleFromPromptText(sharedPrompt.prompt_text)

    return NextResponse.json({
      success: true,
      prompt: {
        id: sharedPrompt.id,
        title: parsedTitle,
        description: sharedPrompt.prompt_text,
        communityTitle: sharedPrompt.community_title || parsedTitle,
        emoji: extractEmojiFromPromptText(sharedPrompt.prompt_text),
        difficulty: sharedPrompt.difficulty,
        ageGroup: sharedPrompt.age_group,
        date: sharedPrompt.date,
        isToday: date === new Date().toISOString().split('T')[0],
        promptType: 'shared_daily',
        stats: {
          totalPosts: sharedPrompt.prompt_popularity?.[0]?.total_posts || 0,
          totalLikes: sharedPrompt.prompt_popularity?.[0]?.total_likes || 0,
          popularityScore: sharedPrompt.prompt_popularity?.[0]?.popularity_score || 0,
          trendingScore: sharedPrompt.prompt_popularity?.[0]?.trending_score || 0
        },
        userPost: userPost ? {
          id: userPost.id,
          imageUrl: userPost.image_url,
          thumbnailUrl: userPost.thumbnail_url,
          createdAt: userPost.created_at,
          likesCount: userPost.likes_count,
          moderationStatus: userPost.moderation_status
        } : null
      }
    })
  } catch (error) {
    console.error('Error in shared daily prompt API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to extract title from prompt text
// In the future, we might store title separately, but for now we'll extract it
function extractTitleFromPromptText(promptText: string): string {
  // Try to extract the first sentence or a reasonable title
  const firstSentence = promptText.split('!')[0] || promptText.split('.')[0]
  
  // Limit to reasonable title length
  if (firstSentence.length > 50) {
    const words = firstSentence.split(' ')
    return words.slice(0, 6).join(' ') + (words.length > 6 ? '...' : '')
  }
  
  return firstSentence
}

// Helper function to extract emoji from prompt text
// In production, we'd store emoji separately
function extractEmojiFromPromptText(promptText: string): string {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
  const matches = promptText.match(emojiRegex)
  return matches ? matches[0] : '🎨'
}