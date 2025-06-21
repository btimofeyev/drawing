import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { PromptGenerator } from '@/lib/openai'

// This endpoint should be called daily at midnight EST (4 AM UTC)
// to pre-generate all prompts for the next day

export async function GET(request: NextRequest) {
  try {
    // Verify this is being called from a trusted source (e.g., Vercel Cron)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check for force overwrite parameter
    const { searchParams } = new URL(request.url)
    const forceOverwrite = searchParams.get('force') === 'true'

    // Get tomorrow's date in UTC
    const tomorrow = new Date()
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    tomorrow.setUTCHours(0, 0, 0, 0)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]


    const ageGroups = ['preschoolers', 'kids', 'tweens'] as const
    const results = []
    const errors = []

    // Generate 2 themed community prompts for each age group using the new MVP approach
    for (const ageGroup of ageGroups) {
      try {
        // Generate the 2 themed community prompts
        const communityPrompts = await PromptGenerator.generateMVPCommunityPrompts(ageGroup)

        for (const prompt of communityPrompts) {
          if (forceOverwrite) {
            // Use upsert to overwrite existing prompts
            const { data, error } = await supabaseAdmin
              .from('prompts')
              .upsert({
                date: tomorrowStr,
                age_group: ageGroup,
                time_slot: prompt.timeSlot,
                difficulty: prompt.difficulty,
                prompt_text: prompt.description
              }, {
                onConflict: 'date,age_group,time_slot'
              })
              .select()
              .single()

            if (error) throw error

            results.push({
              ageGroup,
              timeSlot: prompt.timeSlot,
              status: 'overwritten',
              promptId: data.id,
              prompt: prompt.description,
              title: prompt.title,
              communityTitle: prompt.communityTitle,
              emoji: prompt.emoji,
              difficulty: prompt.difficulty
            })
          } else {
            // Check if prompts already exist for this date/age group
            const { data: existingPrompts } = await supabaseAdmin
              .from('prompts')
              .select('time_slot')
              .eq('date', tomorrowStr)
              .eq('age_group', ageGroup)

            const existingTimeSlots = new Set(existingPrompts?.map(p => p.time_slot) || [])

            if (existingTimeSlots.has(prompt.timeSlot)) {
              results.push({
                ageGroup,
                timeSlot: prompt.timeSlot,
                status: 'already_exists'
              })
              continue
            }

            // Store in database
            const { data, error } = await supabaseAdmin
              .from('prompts')
              .insert({
                date: tomorrowStr,
                age_group: ageGroup,
                time_slot: prompt.timeSlot,
                difficulty: prompt.difficulty,
                prompt_text: prompt.description
              })
              .select()
              .single()

            if (error) throw error

            results.push({
              ageGroup,
              timeSlot: prompt.timeSlot,
              status: 'created',
              promptId: data.id,
              prompt: prompt.description,
              title: prompt.title,
              communityTitle: prompt.communityTitle,
              emoji: prompt.emoji,
              difficulty: prompt.difficulty
            })
          }
        }
      } catch (error) {
        console.error(`Error generating community prompts for ${ageGroup}:`, error)
        console.error('Full error details:', error)
        errors.push({
          ageGroup,
          error: error instanceof Error ? error.message : JSON.stringify(error)
        })
      }
    }

    return NextResponse.json({
      date: tomorrowStr,
      results,
      errors,
      summary: {
        total: ageGroups.length * 2, // 2 time slots per age group
        created: results.filter(r => r.status === 'created').length,
        alreadyExists: results.filter(r => r.status === 'already_exists').length,
        failed: errors.length
      }
    })
  } catch (error) {
    console.error('Error in daily prompt generation:', error)
    return NextResponse.json(
      { error: 'Failed to generate daily prompts' },
      { status: 500 }
    )
  }
}

// POST endpoint for manual trigger with specific date
export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json()
    
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    // Verify admin access (you may want to implement proper auth here)
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ageGroups = ['preschoolers', 'kids', 'tweens'] as const
    const results = []

    // Generate 2 themed community prompts for each age group using the new MVP approach
    for (const ageGroup of ageGroups) {
      try {
        // Generate the 2 themed community prompts
        const communityPrompts = await PromptGenerator.generateMVPCommunityPrompts(ageGroup)

        for (const prompt of communityPrompts) {
          try {
            const { data, error } = await supabaseAdmin
              .from('prompts')
              .upsert({
                date,
                age_group: ageGroup,
                time_slot: prompt.timeSlot,
                difficulty: prompt.difficulty,
                prompt_text: prompt.description
              }, {
                onConflict: 'date,age_group,time_slot'
              })
              .select()
              .single()

            if (error) throw error

            results.push({
              ageGroup,
              timeSlot: prompt.timeSlot,
              status: 'success',
              promptId: data.id,
              prompt: prompt.description,
              title: prompt.title,
              communityTitle: prompt.communityTitle,
              emoji: prompt.emoji,
              difficulty: prompt.difficulty
            })
          } catch (error) {
            results.push({
              ageGroup,
              timeSlot: prompt.timeSlot,
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            })
          }
        }
      } catch (error) {
        results.push({
          ageGroup,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({ date, results })
  } catch (error) {
    console.error('Error generating prompts:', error)
    return NextResponse.json(
      { error: 'Failed to generate prompts' },
      { status: 500 }
    )
  }
}