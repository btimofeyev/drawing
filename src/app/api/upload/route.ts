import { NextRequest, NextResponse } from 'next/server'
import { ChildAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { moderateImage, shouldApproveForChildren } from '@/lib/openai-moderation'
import { getCurrentDateET, getDayBoundsET } from '@/utils/timezone'

export async function POST(request: NextRequest) {
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

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const altText = formData.get('altText') as string
    const promptId = formData.get('promptId') as string
    const timeSlot = formData.get('timeSlot') as string

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!altText) {
      return NextResponse.json(
        { error: 'Alt text is required' },
        { status: 400 }
      )
    }

    if (!timeSlot || !['daily_1', 'daily_2', 'free_draw'].includes(timeSlot)) {
      return NextResponse.json(
        { error: 'Valid time slot is required' },
        { status: 400 }
      )
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPG, PNG, GIF, or WebP images.' },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    const minSize = 1024 // 1KB minimum
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    if (file.size < minSize) {
      return NextResponse.json(
        { error: 'File too small. Please upload a valid image file.' },
        { status: 400 }
      )
    }

    // Validate alt text length
    if (altText.length < 5) {
      return NextResponse.json(
        { error: 'Please provide a more detailed description of your artwork (at least 5 characters).' },
        { status: 400 }
      )
    }

    if (altText.length > 200) {
      return NextResponse.json(
        { error: 'Description too long. Please keep it under 200 characters.' },
        { status: 400 }
      )
    }

    const today = getCurrentDateET()
    const targetTimeSlot = timeSlot as 'daily_1' | 'daily_2' | 'free_draw'

    // Check if child already has a post in this time slot today (Eastern Time)
    const { start: dayStart, end: dayEnd } = getDayBoundsET(today)
    const { data: existingPost, error: checkError } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('child_id', childId)
      .eq('time_slot', targetTimeSlot)
      .gte('created_at', dayStart)
      .lte('created_at', dayEnd)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing posts:', checkError)
      return NextResponse.json(
        { error: 'Failed to validate upload permissions' },
        { status: 500 }
      )
    }

    console.log('Upload check:', {
      childId,
      date: today,
      timeSlot: targetTimeSlot,
      hasExistingPost: !!existingPost
    })

    const canUpload = !existingPost

    if (!canUpload) {
      const timeSlotDisplay = targetTimeSlot === 'daily_1' ? 'Challenge 1' : 
                             targetTimeSlot === 'daily_2' ? 'Challenge 2' : 
                             'Free Draw'
      return NextResponse.json(
        { 
          error: `You've already uploaded artwork for ${timeSlotDisplay} today. Try a different time slot!`,
          timeSlot: targetTimeSlot
        },
        { status: 429 }
      )
    }

    // Validate prompt if provided (not required for free draw)
    let validPromptId: string | null = promptId
    if (targetTimeSlot !== 'free_draw') {
      if (!promptId) {
        return NextResponse.json(
          { error: 'Prompt ID is required for challenge uploads' },
          { status: 400 }
        )
      }

      const { data: prompt, error: promptError } = await supabaseAdmin
        .from('prompts')
        .select('id, date, age_group, time_slot')
        .eq('id', promptId)
        .single()

      if (promptError || !prompt) {
        console.warn('Invalid prompt ID provided:', promptId)
        return NextResponse.json(
          { error: 'Invalid challenge selected' },
          { status: 400 }
        )
      }
      
      if (prompt.age_group !== child.age_group) {
        return NextResponse.json(
          { error: 'This challenge is not for your age group' },
          { status: 400 }
        )
      }
      
      if (prompt.date !== today) {
        return NextResponse.json(
          { error: 'This challenge is not for today' },
          { status: 400 }
        )
      }
      
      if (prompt.time_slot !== targetTimeSlot) {
        return NextResponse.json(
          { error: `This challenge is for ${prompt.time_slot}, not ${targetTimeSlot}` },
          { status: 400 }
        )
      }
    } else {
      // For free draw, set promptId to null
      validPromptId = null
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${childId}/${today}/${targetTimeSlot}_${timestamp}.${fileExtension}`
    const thumbnailName = `${childId}/${today}/${targetTimeSlot}_${timestamp}_thumb.${fileExtension}`

    // Convert file to buffer
    const buffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(buffer)

    // Upload original image
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('artwork')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Failed to upload image:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      )
    }

    // Get public URL for the uploaded image
    const { data: urlData } = supabaseAdmin.storage
      .from('artwork')
      .getPublicUrl(fileName)

    const imageUrl = urlData.publicUrl

    // Create thumbnail (for now, we'll use the same image - in production you'd resize it)
    const { data: thumbUploadData, error: thumbUploadError } = await supabaseAdmin.storage
      .from('artwork')
      .upload(thumbnailName, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    let thumbnailUrl = null
    if (!thumbUploadError) {
      const { data: thumbUrlData } = supabaseAdmin.storage
        .from('artwork')
        .getPublicUrl(thumbnailName)
      thumbnailUrl = thumbUrlData.publicUrl
    }

    // Moderate the image before creating the post
    let moderationStatus: 'pending' | 'approved' | 'rejected' = 'pending'
    
    try {
      // CRITICAL: Always require moderation for child safety
      const moderationResult = await moderateImage(imageUrl)
      
      if (shouldApproveForChildren(moderationResult)) {
        moderationStatus = 'approved'
      } else {
        moderationStatus = 'rejected'
      }
    } catch (moderationError) {
      // CRITICAL: On any moderation failure, reject content for child safety
      if (process.env.NODE_ENV === 'development') {
        console.error('Moderation failed:', moderationError)
      }
      
      // Clean up uploaded files since we're rejecting
      await supabaseAdmin.storage.from('artwork').remove([fileName])
      if (thumbnailName) {
        await supabaseAdmin.storage.from('artwork').remove([thumbnailName])
      }
      
      return NextResponse.json(
        { error: 'Content moderation unavailable. Please try again later or contact support.' },
        { status: 503 }
      )
    }

    // Create the post record
    const { data: newPost, error: postError } = await supabaseAdmin
      .from('posts')
      .insert({
        child_id: childId,
        prompt_id: validPromptId || null,
        image_url: imageUrl,
        thumbnail_url: thumbnailUrl,
        alt_text: altText,
        time_slot: targetTimeSlot,
        moderation_status: moderationStatus
      })
      .select()
      .single()

    if (postError) {
      console.error('Failed to create post:', postError)
      
      // Clean up uploaded files
      await supabaseAdmin.storage.from('artwork').remove([fileName])
      if (thumbnailName) {
        await supabaseAdmin.storage.from('artwork').remove([thumbnailName])
      }

      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      )
    }

    // Note: We no longer need to record in daily_upload_limits table
    // since we're checking the posts table directly for upload limits

    // Update user stats
    const { error: statsError } = await supabaseAdmin
      .rpc('update_user_stats_on_post', {
        p_child_id: childId
      })

    if (statsError) {
      console.error('Failed to update user stats:', statsError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      post: {
        id: newPost.id,
        imageUrl: newPost.image_url,
        thumbnailUrl: newPost.thumbnail_url,
        altText: newPost.alt_text,
        timeSlot: newPost.time_slot,
        createdAt: newPost.created_at,
        moderationStatus: newPost.moderation_status
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    )
  }
}