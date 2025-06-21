import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyParentAuth } from '@/lib/auth'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ artworkId: string }> }
) {
  try {
    const { artworkId } = await params
    
    // Verify parent authentication
    const { parent, error: authError } = await verifyParentAuth(request)
    if (authError || !parent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First, get the artwork to verify ownership
    const { data: artwork, error: artworkError } = await supabaseAdmin
      .from('posts')
      .select(`
        id,
        child_id,
        image_url,
        time_slot,
        created_at,
        child_profiles!inner (
          parent_id
        )
      `)
      .eq('id', artworkId)
      .single()

    if (artworkError || !artwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }

    // Verify the artwork belongs to a child of this parent
    if ((Array.isArray(artwork.child_profiles) ? artwork.child_profiles[0]?.parent_id : (artwork.child_profiles as any)?.parent_id) !== parent.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete the image from storage if it exists
    if (artwork.image_url) {
      try {
        // Extract the storage path from the URL
        const urlParts = artwork.image_url.split('/storage/v1/object/public/')
        if (urlParts.length > 1) {
          const storagePath = urlParts[1]
          const bucketAndPath = storagePath.split('/')
          const bucket = bucketAndPath[0]
          const path = bucketAndPath.slice(1).join('/')
          
          await supabaseAdmin.storage
            .from(bucket)
            .remove([path])
        }
      } catch (storageError) {
        console.error('Error deleting image from storage:', storageError)
        // Continue with post deletion even if storage deletion fails
      }
    }

    // Delete the artwork post
    const { error: deleteError } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', artworkId)

    if (deleteError) {
      console.error('Error deleting artwork:', deleteError)
      return NextResponse.json({ error: 'Failed to delete artwork' }, { status: 500 })
    }

    // Clear the upload limit for this time slot so the child can upload again
    const postDate = new Date(artwork.created_at).toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]
    
    // Only clear the limit if the post was from today
    if (postDate === today && artwork.time_slot) {
      const { error: limitError } = await supabaseAdmin
        .from('daily_upload_limits')
        .delete()
        .eq('child_id', artwork.child_id)
        .eq('date', today)
        .eq('time_slot', artwork.time_slot)
      
      if (limitError) {
        console.error('Failed to clear upload limit:', limitError)
        // Don't fail the request, the post is already deleted
      }
    }

    // Update user stats for the child
    const { error: statsError } = await supabaseAdmin
      .rpc('update_user_stats_on_post', {
        p_child_id: artwork.child_id
      })

    if (statsError) {
      console.error('Failed to update user stats:', statsError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/parent/artwork/[artworkId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}