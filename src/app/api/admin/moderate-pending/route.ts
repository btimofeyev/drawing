import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { moderateImage, shouldApproveForChildren } from '@/lib/openai-moderation'

export async function POST(request: NextRequest) {
  try {
    // Check for admin authorization (you might want to add proper auth here)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all pending posts
    const { data: pendingPosts, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('id, image_url, child_id')
      .eq('moderation_status', 'pending')
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('Error fetching pending posts:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch pending posts' },
        { status: 500 }
      )
    }

    if (!pendingPosts || pendingPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending posts to moderate',
        moderated: 0
      })
    }


    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const results = {
      approved: 0,
      rejected: 0,
      failed: 0
    }

    // Process each post
    for (const post of pendingPosts) {
      try {
        
        const moderationResult = await moderateImage(post.image_url)
        const shouldApprove = shouldApproveForChildren(moderationResult)
        
        const newStatus = shouldApprove ? 'approved' : 'rejected'
        
        // Update the post status
        const { error: updateError } = await supabaseAdmin
          .from('posts')
          .update({ moderation_status: newStatus })
          .eq('id', post.id)

        if (updateError) {
          console.error(`Failed to update post ${post.id}:`, updateError)
          results.failed++
        } else {
          if (shouldApprove) {
            results.approved++
          } else {
            results.rejected++
          }
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`Error moderating post ${post.id}:`, error)
        results.failed++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Moderation complete`,
      results: {
        total: pendingPosts.length,
        approved: results.approved,
        rejected: results.rejected,
        failed: results.failed
      }
    })

  } catch (error) {
    console.error('Bulk moderation error:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk moderation' },
      { status: 500 }
    )
  }
}