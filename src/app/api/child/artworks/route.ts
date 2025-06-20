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

    // Fetch child's artworks with likes
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('posts')
      .select(`
        id,
        image_url,
        thumbnail_url,
        alt_text,
        created_at,
        likes_count,
        time_slot,
        moderation_status,
        prompts (
          id,
          prompt_text,
          difficulty
        )
      `)
      .eq('child_id', childId)
      .order('created_at', { ascending: false })

    if (postsError) {
      console.error('Failed to fetch artworks:', postsError)
      return NextResponse.json(
        { error: 'Failed to fetch artworks' },
        { status: 500 }
      )
    }

    // Transform data to expected format
    const artworks = posts?.map(post => ({
      id: post.id,
      imageUrl: post.image_url,
      thumbnailUrl: post.thumbnail_url,
      altText: post.alt_text,
      createdAt: post.created_at,
      likesCount: post.likes_count,
      timeSlot: post.time_slot,
      moderationStatus: post.moderation_status,
      challenge: post.prompts ? {
        id: post.prompts.id,
        text: post.prompts.prompt_text,
        difficulty: post.prompts.difficulty
      } : null
    })) || []

    return NextResponse.json({
      success: true,
      artworks,
      total: artworks.length
    })

  } catch (error) {
    console.error('Artworks API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artworks' },
      { status: 500 }
    )
  }
}

// DELETE endpoint for removing artwork
export async function DELETE(request: NextRequest) {
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

    // Get post ID from request body
    const { postId } = await request.json()
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID required' },
        { status: 400 }
      )
    }

    // Verify the post belongs to this child
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('id, child_id, image_url, thumbnail_url')
      .eq('id', postId)
      .eq('child_id', childId)
      .single()

    if (fetchError || !post) {
      return NextResponse.json(
        { error: 'Post not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete the post (this will cascade delete likes)
    const { error: deleteError } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('child_id', childId)

    if (deleteError) {
      console.error('Failed to delete post:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete artwork' },
        { status: 500 }
      )
    }

    // Try to delete images from storage (don't fail if this errors)
    try {
      const imagePath = post.image_url.split('/').slice(-3).join('/')
      const thumbnailPath = post.thumbnail_url ? post.thumbnail_url.split('/').slice(-3).join('/') : null

      await supabaseAdmin.storage
        .from('artwork')
        .remove([imagePath])

      if (thumbnailPath) {
        await supabaseAdmin.storage
          .from('artwork')
          .remove([thumbnailPath])
      }
    } catch (storageError) {
      console.error('Failed to delete images from storage:', storageError)
      // Continue anyway - the database record is deleted
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
      message: 'Artwork deleted successfully'
    })

  } catch (error) {
    console.error('Delete artwork error:', error)
    return NextResponse.json(
      { error: 'Failed to delete artwork' },
      { status: 500 }
    )
  }
}