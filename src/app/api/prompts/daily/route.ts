import { NextRequest, NextResponse } from 'next/server'
import { ChildAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { ImprovedPromptGenerator as PromptGenerator, TimeSlot } from '@/lib/openai'
import { cookies } from 'next/headers'
import { getCurrentDateET } from '@/utils/timezone'

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
    const timeSlot = searchParams.get('slot') as 'daily_1' | 'daily_2' | 'free_draw' | null
    const getAllSlots = searchParams.get('all') === 'true'

    // Get today's date in Eastern Time
    const today = getCurrentDateET()

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
      const timeSlots: ('daily_1' | 'daily_2')[] = ['daily_1', 'daily_2']
      const existingSlots = prompts?.map(p => p.time_slot) || []
      const missingSlots = timeSlots.filter(slot => !existingSlots.includes(slot))

      const allPrompts = prompts || []

      // Generate missing prompts
      for (const slot of missingSlots) {
        try {
          const generatedPrompt = await PromptGenerator.generateDailyPrompt({
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
          }, 'real_life', 'everyday activities')
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
      const slotOrder = { daily_1: 0, daily_2: 1, free_draw: 2 }
      allPrompts.sort((a, b) => slotOrder[a.time_slot as keyof typeof slotOrder] - slotOrder[b.time_slot as keyof typeof slotOrder])

      // Add free_draw to the response
      const freeDrawPrompt = {
        id: 'free-draw',
        title: 'Free Draw',
        description: 'Draw anything your heart desires! No rules, no limits - just pure creativity. What are you inspired to create today?',
        difficulty: 'easy' as const,
        date: today,
        timeSlot: 'free_draw' as const,
        emoji: '🎨',
        isToday: true
      }

      const allPromptsWithFreeraw = [
        ...allPrompts.map(prompt => ({
          id: prompt.id,
          title: getSlotTitle(prompt.time_slot),
          description: prompt.prompt_text,
          difficulty: prompt.difficulty,
          date: prompt.date,
          timeSlot: prompt.time_slot,
          emoji: getSlotEmoji(prompt.time_slot),
          isToday: true
        })),
        freeDrawPrompt
      ]

      return NextResponse.json({
        prompts: allPromptsWithFreeraw
      })
    }

    // Get specific time slot or current time slot
    const targetSlot = timeSlot || getCurrentTimeSlot()

    // Handle free_draw specially since it doesn't have database prompts
    if (targetSlot === 'free_draw') {
      return NextResponse.json({
        prompt: {
          id: 'free-draw',
          title: 'Free Draw',
          description: 'Draw anything your heart desires! No rules, no limits - just pure creativity. What are you inspired to create today?',
          difficulty: 'easy',
          date: today,
          timeSlot: 'free_draw',
          emoji: '🎨',
          isToday: true
        }
      })
    }

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
        
        const generatedPrompt = await PromptGenerator.generateDailyPrompt({
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
          }, 'real_life', 'everyday activities')

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

function getCurrentTimeSlot(): 'daily_1' | 'daily_2' | 'free_draw' {
  // For the new system, we'll default to daily_1 since both challenges are available all day
  return 'daily_1'
}

function getSlotTitle(timeSlot: 'daily_1' | 'daily_2' | 'free_draw'): string {
  switch (timeSlot) {
    case 'daily_1': return 'Challenge 1'
    case 'daily_2': return 'Challenge 2'
    case 'free_draw': return 'Free Draw'
    default: return 'Creative Challenge'
  }
}

function getSlotEmoji(timeSlot: 'daily_1' | 'daily_2' | 'free_draw'): string {
  switch (timeSlot) {
    case 'daily_1': return '🎯'
    case 'daily_2': return '⭐'
    case 'free_draw': return '🎨'
    default: return '✨'
  }
}

function getSlotDifficulty(timeSlot: 'daily_1' | 'daily_2' | 'free_draw'): 'easy' | 'medium' | 'hard' {
  switch (timeSlot) {
    case 'daily_1': return 'easy'    // First challenge is easy
    case 'daily_2': return 'medium'  // Second challenge is medium
    case 'free_draw': return 'easy'  // Free draw is easy/flexible
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