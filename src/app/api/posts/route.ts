import { NextRequest, NextResponse } from 'next/server'
import { ChildAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { 
      imageUrl, 
      thumbnailUrl, 
      altText, 
      promptId, 
      timeSlot 
    } = body

    // Validate required fields
    if (!imageUrl || !altText) {
      return NextResponse.json(
        { error: 'Image URL and alt text are required' },
        { status: 400 }
      )
    }

    // Require time slot to be explicitly provided
    if (!timeSlot || !['daily_1', 'daily_2', 'free_draw'].includes(timeSlot)) {
      return NextResponse.json(
        { error: 'Time slot is required. Must be daily_1, daily_2, or free_draw' },
        { status: 400 }
      )
    }

    const today = new Date().toISOString().split('T')[0]
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
      return NextResponse.json(
        { error: 'Failed to validate upload permissions' },
        { status: 500 }
      )
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
        return NextResponse.json(
          { error: 'This prompt is not for your age group' },
          { status: 400 }
        )
      } else if (prompt.date !== today) {
        return NextResponse.json(
          { error: 'This prompt is not for today' },
          { status: 400 }
        )
      } else if (prompt.time_slot !== targetTimeSlot) {
        return NextResponse.json(
          { error: `This prompt is for ${prompt.time_slot}, not ${targetTimeSlot}` },
          { status: 400 }
        )
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
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      )
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
      // Don't fail the request, just log the error
    }

    // Update user stats
    const { error: statsError } = await supabaseAdmin
      .rpc('update_user_stats_on_post', {
        p_child_id: childId
      })

    if (statsError) {
      console.error('Failed to update user stats:', statsError)
      // Don't fail the request, just log the error
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
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}

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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const timeSlot = searchParams.get('timeSlot') as 'daily_1' | 'daily_2' | 'free_draw' | null
    const date = searchParams.get('date')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build query
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
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (timeSlot) {
      query = query.eq('time_slot', timeSlot)
    }

    if (date) {
      // Filter by date (posts created on specific date)
      const startOfDay = new Date(date)
      const endOfDay = new Date(date)
      endOfDay.setDate(endOfDay.getDate() + 1)
      
      query = query
        .gte('created_at', startOfDay.toISOString())
        .lt('created_at', endOfDay.toISOString())
    }

    const { data: posts, error } = await query

    if (error) {
      console.error('Failed to fetch posts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      )
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
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

