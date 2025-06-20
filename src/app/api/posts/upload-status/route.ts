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

    // Use time slot system - query posts directly
    let uploadStatus = []
    let totalUploadsToday = 0
    
    // Get today's posts for this child
    const { data: todaysPosts, error } = await supabaseAdmin
      .from('posts')
      .select('id, time_slot, image_url, thumbnail_url, alt_text, created_at, likes_count, moderation_status')
      .eq('child_id', child.id)
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`)

    if (error) {
      console.error('Failed to fetch upload status:', error)
      return NextResponse.json(
        { error: 'Failed to fetch upload status' },
        { status: 500 }
      )
    }

    // Build status for time slot system (check all time slots including free draw)
    const timeSlots = ['daily_1', 'daily_2', 'free_draw']
    uploadStatus = timeSlots.map(slot => {
      const existingPost = todaysPosts?.find(post => post.time_slot === slot)
      
      return {
        timeSlot: slot,
        canUpload: !existingPost,
        hasUploaded: !!existingPost,
        uploadedAt: existingPost?.created_at || null,
        postId: existingPost?.id || null,
        post: existingPost ? {
          id: existingPost.id,
          imageUrl: existingPost.image_url,
          thumbnailUrl: existingPost.thumbnail_url,
          altText: existingPost.alt_text,
          createdAt: existingPost.created_at,
          likesCount: existingPost.likes_count,
          moderationStatus: existingPost.moderation_status
        } : null
      }
    })
    
    totalUploadsToday = todaysPosts?.length || 0

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

