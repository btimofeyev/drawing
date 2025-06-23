import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  // Check admin authentication
  const { isAdmin, error } = await requireAdminAuth()
  if (!isAdmin) {
    return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get rejected posts with child information
    const { data: rejectedPosts, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select(`
        id,
        image_url,
        alt_text,
        created_at,
        moderation_status,
        child_profiles!inner (
          username,
          name
        )
      `)
      .eq('moderation_status', 'rejected')
      .order('created_at', { ascending: false })
      .limit(50) // Limit to last 50 rejected items

    if (fetchError) {
      console.error('Error fetching rejected content:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch rejected content' },
        { status: 500 }
      )
    }

    // Transform the data for the frontend
    const rejectedContent = rejectedPosts?.map(post => {
      const childProfile = Array.isArray(post.child_profiles) ? post.child_profiles[0] : post.child_profiles
      return {
        id: post.id,
        imageUrl: post.image_url,
        altText: post.alt_text || 'No description provided',
        createdAt: post.created_at,
        childUsername: childProfile?.username || 'Unknown',
        childName: childProfile?.name || 'Unknown User',
        moderationReason: 'Content failed AI moderation check' // You can expand this later with specific reasons
      }
    }) || []

    return NextResponse.json({
      success: true,
      rejectedContent,
      count: rejectedContent.length
    })

  } catch (error) {
    console.error('Admin moderation endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}