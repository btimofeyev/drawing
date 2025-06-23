import { NextRequest, NextResponse } from 'next/server'
import { ChildAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getAuthenticatedChild, createErrorResponse } from '@/utils/apiAuth'
import { getCurrentDateET, getDayBoundsET } from '@/utils/timezone'

export async function POST(request: NextRequest) {
  try {
    const { childId, error } = await getAuthenticatedChild(request)
    if (error) return error

    const child = await ChildAuth.getChildProfile(childId!)
    if (!child) {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { imageUrl, thumbnailUrl, altText, promptId, timeSlot } = body

    if (!imageUrl || !altText) {
      return createErrorResponse('Image URL and alt text are required', 400)
    }

    if (!timeSlot || !['daily_1', 'daily_2', 'free_draw'].includes(timeSlot)) {
      return createErrorResponse('Time slot is required. Must be daily_1, daily_2, or free_draw', 400)
    }

    const today = getCurrentDateET()
    const targetTimeSlot = timeSlot

    // Check if child can upload to this time slot
    const { data: canUpload, error: canUploadError } = await supabaseAdmin
      .rpc('can_child_upload_to_slot', {
        p_child_id: childId,
        p_date: today,
        p_time_slot: targetTimeSlot
      })

    if (canUploadError) {
      console.error('Error checking upload permissions:', canUploadError)
      return createErrorResponse('Failed to validate upload permissions')
    }

    if (!canUpload) {
      return NextResponse.json(
        { 
          error: `You've already uploaded artwork for the ${targetTimeSlot} slot today. Try a different time slot!`,
          timeSlot: targetTimeSlot
        },
        { status: 429 }
      )
    }

    // Validate prompt if provided
    let validPromptId = promptId
    if (promptId) {
      const { data: prompt, error: promptError } = await supabaseAdmin
        .from('prompts')
        .select('id, date, age_group, time_slot')
        .eq('id', promptId)
        .single()

      if (promptError || !prompt) {
        console.warn('Invalid prompt ID provided:', promptId)
        validPromptId = null
      } else if (prompt.age_group !== child.age_group) {
        return createErrorResponse('This prompt is not for your age group', 400)
      } else if (prompt.date !== today) {
        return createErrorResponse('This prompt is not for today', 400)
      } else if (prompt.time_slot !== targetTimeSlot) {
        return createErrorResponse(`This prompt is for ${prompt.time_slot}, not ${targetTimeSlot}`, 400)
      }
    }

    // Create the post
    const { data: newPost, error: postError } = await supabaseAdmin
      .from('posts')
      .insert({
        child_id: childId,
        prompt_id: validPromptId,
        image_url: imageUrl,
        thumbnail_url: thumbnailUrl,
        alt_text: altText,
        time_slot: targetTimeSlot,
        moderation_status: 'pending'
      })
      .select()
      .single()

    if (postError) {
      console.error('Failed to create post:', postError)
      return createErrorResponse('Failed to create post')
    }

    // Increment upload count for this slot
    const { error: incrementError } = await supabaseAdmin
      .rpc('increment_upload_count', {
        p_child_id: childId,
        p_date: today,
        p_time_slot: targetTimeSlot
      })

    if (incrementError) {
      console.error('Failed to increment upload count:', incrementError)
    }

    // Update user stats
    const { error: statsError } = await supabaseAdmin
      .rpc('update_user_stats_on_post', {
        p_child_id: childId
      })

    if (statsError) {
      console.error('Failed to update user stats:', statsError)
    }

    return NextResponse.json({
      success: true,
      post: {
        id: newPost.id,
        imageUrl: newPost.image_url,
        thumbnailUrl: newPost.thumbnail_url,
        altText: newPost.alt_text,
        timeSlot: newPost.time_slot,
        createdAt: newPost.created_at,
        moderationStatus: newPost.moderation_status
      }
    })

  } catch (error) {
    console.error('Post creation error:', error)
    return createErrorResponse('Failed to create post')
  }
}

export async function GET(request: NextRequest) {
  try {
    const { childId, error: authError } = await getAuthenticatedChild(request)
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const timeSlot = searchParams.get('timeSlot') as 'daily_1' | 'daily_2' | 'free_draw' | null
    const date = searchParams.get('date')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabaseAdmin
      .from('posts')
      .select(`
        id,
        image_url,
        thumbnail_url,
        alt_text,
        time_slot,
        created_at,
        likes_count,
        moderation_status,
        prompts(id, prompt_text, difficulty)
      `)
      .eq('child_id', childId!)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (timeSlot) {
      query = query.eq('time_slot', timeSlot)
    }

    if (date) {
      // Use Eastern Time bounds for consistent daily cycles
      const { start: dayStart, end: dayEnd } = getDayBoundsET(date)
      
      query = query
        .gte('created_at', dayStart)
        .lte('created_at', dayEnd)
    }

    const { data: posts, error } = await query

    if (error) {
      console.error('Failed to fetch posts:', error)
      return createErrorResponse('Failed to fetch posts')
    }

    return NextResponse.json({
      posts: posts.map(post => ({
        id: post.id,
        imageUrl: post.image_url,
        thumbnailUrl: post.thumbnail_url,
        altText: post.alt_text,
        timeSlot: post.time_slot,
        createdAt: post.created_at,
        likesCount: post.likes_count,
        moderationStatus: post.moderation_status,
        prompt: post.prompts && Array.isArray(post.prompts) && post.prompts.length > 0 ? {
          id: post.prompts[0].id,
          text: post.prompts[0].prompt_text,
          difficulty: post.prompts[0].difficulty
        } : post.prompts && !Array.isArray(post.prompts) ? {
          id: (post.prompts as any).id,
          text: (post.prompts as any).prompt_text,
          difficulty: (post.prompts as any).difficulty
        } : null
      }))
    })

  } catch (error) {
    console.error('Posts fetch error:', error)
    return createErrorResponse('Failed to fetch posts')
  }
}

