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

    // Get today's date
    const today = new Date().toISOString().split('T')[0]

    // Use time slot system 
    let uploadStatus = []
    let totalUploadsToday = 0
    
    const { data: uploadLimits, error } = await supabaseAdmin
      .from('daily_upload_limits')
      .select(`
        time_slot,
        uploaded_at,
        post_id,
        posts!inner(
          id,
          image_url,
          thumbnail_url,
          alt_text,
          created_at,
          likes_count,
          moderation_status
        )
      `)
      .eq('child_id', child.id)
      .eq('date', today)

    if (error) {
      console.error('Failed to fetch upload status:', error)
      return NextResponse.json(
        { error: 'Failed to fetch upload status' },
        { status: 500 }
      )
    }

    // Build status for time slot system (only check prompted challenges, not free draw)
    const timeSlots = ['daily_1', 'daily_2', 'free_draw']
    uploadStatus = timeSlots.map(slot => {
      const existingUpload = uploadLimits?.find(ul => ul.time_slot === slot)
      
      // Free draw has unlimited uploads
      if (slot === 'free_draw') {
        return {
          timeSlot: slot,
          canUpload: true, // Always can upload to free draw
          hasUploaded: false, // Don't show as uploaded since unlimited
          uploadedAt: null,
          postId: null,
          post: null
        }
      }
      
      return {
        timeSlot: slot,
        canUpload: !existingUpload,
        hasUploaded: !!existingUpload,
        uploadedAt: existingUpload?.uploaded_at || null,
        postId: existingUpload?.post_id || null,
        post: existingUpload?.posts && Array.isArray(existingUpload.posts) && existingUpload.posts.length > 0 ? {
          id: existingUpload.posts[0].id,
          imageUrl: existingUpload.posts[0].image_url,
          thumbnailUrl: existingUpload.posts[0].thumbnail_url,
          altText: existingUpload.posts[0].alt_text,
          createdAt: existingUpload.posts[0].created_at,
          likesCount: existingUpload.posts[0].likes_count,
          moderationStatus: existingUpload.posts[0].moderation_status
        } : existingUpload?.posts && !Array.isArray(existingUpload.posts) ? {
          id: (existingUpload.posts as any).id,
          imageUrl: (existingUpload.posts as any).image_url,
          thumbnailUrl: (existingUpload.posts as any).thumbnail_url,
          altText: (existingUpload.posts as any).alt_text,
          createdAt: (existingUpload.posts as any).created_at,
          likesCount: (existingUpload.posts as any).likes_count,
          moderationStatus: (existingUpload.posts as any).moderation_status
        } : null
      }
    })
    
    totalUploadsToday = uploadLimits?.length || 0

    return NextResponse.json({
      uploadStatus,
      date: today,
      totalUploadsToday,
      maxUploadsPerDay: 3,
      timeSlots: {
        daily_1: {
          label: 'Challenge 1',
          description: 'First daily creative challenge',
          icon: '🎯'
        },
        daily_2: {
          label: 'Challenge 2', 
          description: 'Second daily creative challenge',
          icon: '⭐'
        },
        free_draw: {
          label: 'Free Draw',
          description: 'Express yourself with unlimited creativity',
          icon: '🎨'
        }
      }
    })
  } catch (error) {
    console.error('Upload status error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch upload status' },
      { status: 500 }
    )
  }
}

