import { NextRequest, NextResponse } from 'next/server'
import { ChildAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { PromptGenerator, TimeSlot } from '@/lib/openai'
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const timeSlot = searchParams.get('slot') as 'morning' | 'afternoon' | 'evening' | null
    const getAllSlots = searchParams.get('all') === 'true'

    // Get today's date
    const today = new Date().toISOString().split('T')[0]

    if (getAllSlots) {
      // Return all three time slots for today
      const { data: prompts, error } = await supabaseAdmin
        .from('prompts')
        .select('*')
        .eq('date', today)
        .eq('age_group', child.age_group)
        .order('time_slot', { ascending: true })

      if (error) {
        console.error('Failed to fetch daily prompts:', error)
      }

      // Generate missing prompts
      const timeSlots: ('morning' | 'afternoon' | 'evening')[] = ['morning', 'afternoon', 'evening']
      const existingSlots = prompts?.map(p => p.time_slot) || []
      const missingSlots = timeSlots.filter(slot => !existingSlots.includes(slot))

      const allPrompts = prompts || []

      // Generate missing prompts
      for (const slot of missingSlots) {
        try {
          const generatedPrompt = await PromptGenerator.generateSlotPrompt({
            ageGroup: child.age_group,
            timeSlot: slot,
            difficulty: 'easy'
          })

          // Store the generated prompt in database
          const { data: newPrompt, error: insertError } = await supabaseAdmin
            .from('prompts')
            .insert({
              date: today,
              age_group: child.age_group,
              difficulty: generatedPrompt.difficulty,
              prompt_text: generatedPrompt.description,
              time_slot: slot
            })
            .select()
            .single()

          if (!insertError && newPrompt) {
            allPrompts.push(newPrompt)
          }
        } catch (error) {
          console.error(`Failed to generate ${slot} prompt:`, error)
          // Add fallback prompt
          const fallback = PromptGenerator.getFallbackPrompt({
            ageGroup: child.age_group,
            difficulty: getSlotDifficulty(slot),
            timeSlot: slot
          })
          allPrompts.push({
            id: `fallback-${slot}`,
            date: today,
            age_group: child.age_group,
            difficulty: fallback.difficulty,
            prompt_text: fallback.description,
            time_slot: slot,
            created_at: new Date().toISOString()
          })
        }
      }

      // Sort by time slot order
      const slotOrder = { morning: 0, afternoon: 1, evening: 2 }
      allPrompts.sort((a, b) => slotOrder[a.time_slot as keyof typeof slotOrder] - slotOrder[b.time_slot as keyof typeof slotOrder])

      return NextResponse.json({
        prompts: allPrompts.map(prompt => ({
          id: prompt.id,
          title: getSlotTitle(prompt.time_slot),
          description: prompt.prompt_text,
          difficulty: prompt.difficulty,
          date: prompt.date,
          timeSlot: prompt.time_slot,
          emoji: getSlotEmoji(prompt.time_slot),
          isToday: true
        }))
      })
    }

    // Get specific time slot or current time slot
    const targetSlot = timeSlot || getCurrentTimeSlot()

    // Fetch today's prompt for child's age group and time slot
    const { data: prompt, error } = await supabaseAdmin
      .from('prompts')
      .select('*')
      .eq('date', today)
      .eq('age_group', child.age_group)
      .eq('time_slot', targetSlot)
      .single()

    if (error || !prompt) {
      // If no prompt for today, try to generate one with OpenAI
      try {
        
        const generatedPrompt = await PromptGenerator.generateSlotPrompt({
          ageGroup: child.age_group,
          timeSlot: targetSlot,
          difficulty: 'easy'
        })

        // Store the generated prompt in database
        const { data: newPrompt, error: insertError } = await supabaseAdmin
          .from('prompts')
          .insert({
            date: today,
            age_group: child.age_group,
            difficulty: generatedPrompt.difficulty,
            prompt_text: generatedPrompt.description,
            time_slot: targetSlot
          })
          .select()
          .single()

        if (insertError) {
          console.error('Failed to store generated prompt:', insertError)
        }

        return NextResponse.json({
          prompt: {
            id: newPrompt?.id || 'generated',
            title: getSlotTitle(targetSlot),
            description: generatedPrompt.description,
            difficulty: generatedPrompt.difficulty,
            date: today,
            timeSlot: targetSlot,
            emoji: getSlotEmoji(targetSlot),
            isToday: true
          }
        })
      } catch (openaiError) {
        console.error('OpenAI generation failed:', openaiError)
        
        // Final fallback - get any recent prompt for this time slot
        const { data: fallbackPrompt, error: fallbackError } = await supabaseAdmin
          .from('prompts')
          .select('*')
          .eq('age_group', child.age_group)
          .eq('time_slot', targetSlot)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (fallbackError || !fallbackPrompt) {
          // Ultimate fallback - use hardcoded prompt
          const fallback = PromptGenerator.getFallbackPrompt({
            ageGroup: child.age_group,
            difficulty: getSlotDifficulty(targetSlot),
            timeSlot: targetSlot
          })

          return NextResponse.json({
            prompt: {
              id: 'fallback',
              title: getSlotTitle(targetSlot),
              description: fallback.description,
              difficulty: fallback.difficulty,
              date: today,
              timeSlot: targetSlot,
              emoji: getSlotEmoji(targetSlot),
              isToday: true
            }
          })
        }

        return NextResponse.json({
          prompt: {
            id: fallbackPrompt.id,
            title: getSlotTitle(targetSlot),
            description: fallbackPrompt.prompt_text,
            difficulty: fallbackPrompt.difficulty,
            date: fallbackPrompt.date,
            timeSlot: fallbackPrompt.time_slot,
            emoji: getSlotEmoji(fallbackPrompt.time_slot),
            isToday: false
          }
        })
      }
    }

    return NextResponse.json({
      prompt: {
        id: prompt.id,
        title: getSlotTitle(prompt.time_slot),
        description: prompt.prompt_text,
        difficulty: prompt.difficulty,
        date: prompt.date,
        timeSlot: prompt.time_slot,
        emoji: getSlotEmoji(prompt.time_slot),
        isToday: true
      }
    })
  } catch (error) {
    console.error('Daily prompt error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily prompt' },
      { status: 500 }
    )
  }
}

function getCurrentTimeSlot(): 'morning' | 'afternoon' | 'evening' {
  // Get current UTC time and subtract 4 hours for EST equivalent
  const now = new Date()
  const utcHour = now.getUTCHours()
  let hour = utcHour - 4
  
  // Handle negative hours (wrap around to previous day)
  if (hour < 0) {
    hour = hour + 24
  }
  
  if (hour >= 6 && hour < 12) {
    return 'morning'
  } else if (hour >= 12 && hour < 18) {
    return 'afternoon'
  } else {
    return 'evening'
  }
}

function getSlotTitle(timeSlot: 'morning' | 'afternoon' | 'evening'): string {
  switch (timeSlot) {
    case 'morning': return 'Morning Challenge'
    case 'afternoon': return 'Afternoon Challenge'
    case 'evening': return 'Evening Challenge'
    default: return 'Creative Challenge'
  }
}

function getSlotEmoji(timeSlot: 'morning' | 'afternoon' | 'evening'): string {
  switch (timeSlot) {
    case 'morning': return '🌅'
    case 'afternoon': return '☀️'
    case 'evening': return '🌆'
    default: return '✨'
  }
}

function getSlotDifficulty(timeSlot: 'morning' | 'afternoon' | 'evening'): 'easy' | 'medium' | 'hard' {
  switch (timeSlot) {
    case 'morning': return 'easy'    // Start the day easy
    case 'afternoon': return 'medium' // Ramp up difficulty
    case 'evening': return 'hard'    // Challenge for the evening
    default: return 'easy'
  }
}

function getDifficultyEmoji(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return '🌟'
    case 'medium': return '🎨'
    case 'hard': return '🚀'
    default: return '✨'
  }
}