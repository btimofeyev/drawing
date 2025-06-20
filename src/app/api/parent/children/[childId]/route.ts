import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyParentAuth } from '@/lib/auth'

export async function DELETE(
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
      .select('id, username')
      .eq('id', childId)
      .eq('parent_id', parent.id)
      .single()

    if (childError || !child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    // Get all posts to delete associated images from storage
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('posts')
      .select('id, image_url')
      .eq('child_id', childId)

    if (!postsError && posts && posts.length > 0) {
      // Delete all images from storage
      for (const post of posts) {
        if (post.image_url) {
          try {
            // Extract the storage path from the URL
            const urlParts = post.image_url.split('/storage/v1/object/public/')
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
            // Continue with deletion even if storage deletion fails
          }
        }
      }
    }

    // Delete the child profile (this will cascade delete all related data)
    const { error: deleteError } = await supabaseAdmin
      .from('child_profiles')
      .delete()
      .eq('id', childId)

    if (deleteError) {
      console.error('Error deleting child account:', deleteError)
      return NextResponse.json({ error: 'Failed to delete child account' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/parent/children/[childId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}