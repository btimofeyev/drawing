import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyParentAuth } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const { childId } = await params
    
    // Verify parent authentication
    const { parent, error: authError } = await verifyParentAuth(request)
    if (authError || !parent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify this child belongs to the parent
    const { data: child, error: childError } = await supabaseAdmin
      .from('child_profiles')
      .select('id')
      .eq('id', childId)
      .eq('parent_id', parent.id)
      .single()

    if (childError || !child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    // Get all artwork for this child
    const { data: artwork, error: artworkError } = await supabaseAdmin
      .from('posts')
      .select(`
        id,
        image_url,
        thumbnail_url,
        alt_text,
        created_at,
        likes_count,
        moderation_status,
        prompts (
          id,
          prompt_text,
          difficulty
        )
      `)
      .eq('child_id', childId)
      .order('created_at', { ascending: false })

    if (artworkError) {
      console.error('Error fetching artwork:', artworkError)
      return NextResponse.json({ error: 'Failed to fetch artwork' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      artwork: artwork?.map(post => ({
        id: post.id,
        imageUrl: post.image_url,
        thumbnailUrl: post.thumbnail_url,
        altText: post.alt_text,
        createdAt: post.created_at,
        likesCount: post.likes_count,
        moderationStatus: post.moderation_status,
        challenge: post.prompts && Array.isArray(post.prompts) && post.prompts.length > 0 ? {
          id: post.prompts[0].id,
          text: post.prompts[0].prompt_text,
          difficulty: post.prompts[0].difficulty
        } : post.prompts && !Array.isArray(post.prompts) ? {
          id: (post.prompts as any).id,
          text: (post.prompts as any).prompt_text,
          difficulty: (post.prompts as any).difficulty
        } : null
      })) || []
    })
  } catch (error) {
    console.error('Error in GET /api/parent/children/[childId]/artwork:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}