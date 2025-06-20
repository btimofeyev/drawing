import { NextRequest, NextResponse } from 'next/server'
import { ChildAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Get child auth cookie (optional for views)
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('child_auth')
    
    let childId: string | null = null
    if (authCookie?.value) {
      try {
        const authData = JSON.parse(authCookie.value)
        childId = authData.childId
      } catch (error) {
        // Continue without child ID for anonymous views
      }
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

    // Use the database function to increment view count
    const { error: viewError } = await supabaseAdmin
      .rpc('increment_post_views', {
        p_post_id: postId,
        p_child_id: childId
      })

    if (viewError) {
      console.error('Failed to increment views:', viewError)
      return NextResponse.json(
        { error: 'Failed to track view' },
        { status: 500 }
      )
    }

    // Get updated view count
    const { data: updatedPost, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('views_count')
      .eq('id', postId)
      .single()

    return NextResponse.json({
      success: true,
      viewsCount: updatedPost?.views_count || 0
    })

  } catch (error) {
    console.error('View tracking API error:', error)
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    )
  }
}