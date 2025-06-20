import { NextRequest, NextResponse } from 'next/server'
import { ChildAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { PromptGenerator } from '@/lib/openai'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get child auth cookie
    const cookieStore = cookies()
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

    // Fetch today's prompt for child's age group
    const { data: prompt, error } = await supabaseAdmin
      .from('prompts')
      .select('*')
      .eq('date', today)
      .eq('age_group', child.age_group)
      .order('difficulty', { ascending: true })
      .limit(1)
      .single()

    if (error || !prompt) {
      // If no prompt for today, try to generate one with OpenAI
      try {
        console.log(`No prompt found for ${today}, generating with OpenAI...`)
        
        const generatedPrompt = await PromptGenerator.generateDailyPrompt({
          ageGroup: child.age_group,
          difficulty: 'easy' // Default to easy for daily prompt
        })

        // Store the generated prompt in database
        const { data: newPrompt, error: insertError } = await supabaseAdmin
          .from('prompts')
          .insert({
            date: today,
            age_group: child.age_group,
            difficulty: generatedPrompt.difficulty,
            prompt_text: generatedPrompt.description
          })
          .select()
          .single()

        if (insertError) {
          console.error('Failed to store generated prompt:', insertError)
        }

        return NextResponse.json({
          prompt: {
            id: newPrompt?.id || 'generated',
            title: generatedPrompt.title,
            description: generatedPrompt.description,
            difficulty: generatedPrompt.difficulty,
            date: today,
            emoji: generatedPrompt.emoji,
            isToday: true
          }
        })
      } catch (openaiError) {
        console.error('OpenAI generation failed:', openaiError)
        
        // Final fallback - get any recent prompt
        const { data: fallbackPrompt, error: fallbackError } = await supabaseAdmin
          .from('prompts')
          .select('*')
          .eq('age_group', child.age_group)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (fallbackError || !fallbackPrompt) {
          // Ultimate fallback - use hardcoded prompt
          const fallback = PromptGenerator.getFallbackPrompt({
            ageGroup: child.age_group,
            difficulty: 'easy'
          })

          return NextResponse.json({
            prompt: {
              id: 'fallback',
              title: fallback.title,
              description: fallback.description,
              difficulty: fallback.difficulty,
              date: today,
              emoji: fallback.emoji,
              isToday: true
            }
          })
        }

        return NextResponse.json({
          prompt: {
            id: fallbackPrompt.id,
            title: `Creative Challenge`,
            description: fallbackPrompt.prompt_text,
            difficulty: fallbackPrompt.difficulty,
            date: fallbackPrompt.date,
            emoji: getDifficultyEmoji(fallbackPrompt.difficulty),
            isToday: false
          }
        })
      }
    }

    return NextResponse.json({
      prompt: {
        id: prompt.id,
        title: `Today's Challenge`,
        description: prompt.prompt_text,
        difficulty: prompt.difficulty,
        date: prompt.date,
        emoji: getDifficultyEmoji(prompt.difficulty),
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

function getDifficultyEmoji(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return '🌟'
    case 'medium': return '🎨'
    case 'hard': return '🚀'
    default: return '✨'
  }
}