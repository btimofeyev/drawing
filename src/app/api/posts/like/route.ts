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

    // Get post ID from request body
    const { postId } = await request.json()
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID required' },
        { status: 400 }
      )
    }

    // Verify the post exists and is approved
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('id, child_id, moderation_status')
      .eq('id', postId)
      .eq('moderation_status', 'approved')
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Prevent self-liking
    if (post.child_id === childId) {
      return NextResponse.json(
        { error: 'Cannot like your own post' },
        { status: 400 }
      )
    }

    // Use the database function to handle the like/unlike
    const { data: isLiked, error: likeError } = await supabaseAdmin
      .rpc('handle_child_like', {
        p_child_id: childId,
        p_post_id: postId
      })

    if (likeError) {
      console.error('Failed to handle like:', likeError)
      return NextResponse.json(
        { error: 'Failed to process like' },
        { status: 500 }
      )
    }

    // Update the liker's stats
    const { error: statsError } = await supabaseAdmin
      .rpc('update_user_stats_on_like', {
        p_child_id: childId,
        p_liked: isLiked
      })

    if (statsError) {
      console.error('Failed to update liker stats:', statsError)
    }

    // Update the post creator's stats
    const { error: creatorStatsError } = await supabaseAdmin
      .rpc('update_user_stats_on_like_received', {
        p_child_id: post.child_id,
        p_liked: isLiked
      })

    if (creatorStatsError) {
      console.error('Failed to update creator stats:', creatorStatsError)
    }

    // Get updated like count
    const { data: updatedPost, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('likes_count')
      .eq('id', postId)
      .single()

    return NextResponse.json({
      success: true,
      isLiked,
      likesCount: updatedPost?.likes_count || 0
    })

  } catch (error) {
    console.error('Like API error:', error)
    return NextResponse.json(
      { error: 'Failed to process like' },
      { status: 500 }
    )
  }
}