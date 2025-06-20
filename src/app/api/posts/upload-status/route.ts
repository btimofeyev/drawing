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

    // Build status for time slot system
    const timeSlots = ['morning', 'afternoon', 'evening']
    uploadStatus = timeSlots.map(slot => {
      const existingUpload = uploadLimits?.find(ul => ul.time_slot === slot)
      
      return {
        timeSlot: slot,
        canUpload: !existingUpload,
        hasUploaded: !!existingUpload,
        uploadedAt: existingUpload?.uploaded_at || null,
        postId: existingUpload?.post_id || null,
        post: existingUpload?.posts ? {
          id: existingUpload.posts.id,
          imageUrl: existingUpload.posts.image_url,
          thumbnailUrl: existingUpload.posts.thumbnail_url,
          altText: existingUpload.posts.alt_text,
          createdAt: existingUpload.posts.created_at,
          likesCount: existingUpload.posts.likes_count,
          moderationStatus: existingUpload.posts.moderation_status
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
        morning: {
          label: 'Morning Challenge',
          description: 'Start your day with creativity',
          icon: '🌅'
        },
        afternoon: {
          label: 'Afternoon Challenge', 
          description: 'Midday artistic inspiration',
          icon: '☀️'
        },
        evening: {
          label: 'Evening Challenge',
          description: 'End your day with art',
          icon: '🌆'
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

