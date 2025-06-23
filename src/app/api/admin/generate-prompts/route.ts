import { NextRequest, NextResponse } from 'next/server'
import { ImprovedPromptGenerator as PromptGenerator, TimeSlot } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentDateET } from '@/utils/timezone'
import { requireAdminAuth } from '@/lib/adminAuth'

export async function POST(request: NextRequest) {
  // Check admin authentication
  const { isAdmin, error } = await requireAdminAuth()
  if (!isAdmin) {
    return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { date, ageGroups = ['preschoolers', 'kids', 'tweens'], regenerate = false } = body

    // Use Eastern Time for consistency
    const dateStr = date || getCurrentDateET()


    const generatedPrompts = []

    for (const ageGroup of ageGroups) {
      // Check if prompts already exist for this date/age group
      const { data: existing } = await supabaseAdmin
        .from('prompts')
        .select('*')
        .eq('date', dateStr)
        .eq('age_group', ageGroup)

      if (existing && existing.length > 0 && !regenerate) {
        generatedPrompts.push(...existing)
        continue
      }

      // If regenerating, delete ALL existing prompts for this date/age_group
      if (regenerate) {
        const { error: deleteError } = await supabaseAdmin
          .from('prompts')
          .delete()
          .eq('date', dateStr)
          .eq('age_group', ageGroup)
        
        if (deleteError) {
          console.error(`Failed to delete existing prompts for ${ageGroup}:`, deleteError)
        }
      }

      // Generate prompts for each time slot
      const timeSlots: TimeSlot[] = ['daily_1', 'daily_2', 'free_draw']
      
      for (const timeSlot of timeSlots) {
        try {
          // Use different difficulties to work around the unique constraint
          let difficulty: 'easy' | 'medium' | 'hard'
          if (timeSlot === 'daily_1') {
            difficulty = 'easy'
          } else if (timeSlot === 'daily_2') {
            difficulty = 'medium'
          } else {
            // free_draw uses hard for uniqueness
            difficulty = 'hard'
          }
          
          const prompt = await PromptGenerator.generateDailyPrompt({
            ageGroup,
            timeSlot,
            difficulty
          })

          // Store in database
          const { data: newPrompt, error } = await supabaseAdmin
            .from('prompts')
            .insert({
              date: dateStr,
              age_group: ageGroup,
              difficulty: prompt.difficulty,
              prompt_text: prompt.description,
              time_slot: timeSlot
            })
            .select()
            .single()

          if (error) {
            console.error(`Failed to store ${timeSlot} prompt for ${ageGroup}:`, error)
          } else {
            generatedPrompts.push(newPrompt)
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (error) {
          console.error(`Failed to generate ${timeSlot} prompt for ${ageGroup}:`, error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      date: dateStr,
      generated: generatedPrompts.length,
      prompts: generatedPrompts
    })
  } catch (error) {
    console.error('Generate prompts error:', error)
    return NextResponse.json(
      { error: 'Failed to generate prompts' },
      { status: 500 }
    )
  }
}

// Generate prompts for the next week
export async function GET(request: NextRequest) {
  // Check admin authentication
  const { isAdmin, error } = await requireAdminAuth()
  if (!isAdmin) {
    return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const days = parseInt(url.searchParams.get('days') || '7')
    
    const results = []
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      
      const response = await fetch(`${url.origin}/api/admin/generate-prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          date: date.toISOString().split('T')[0] 
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        results.push(data)
      }
      
      // Delay between days to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    return NextResponse.json({
      success: true,
      generatedDays: results.length,
      results
    })
  } catch (error) {
    console.error('Batch generate prompts error:', error)
    return NextResponse.json(
      { error: 'Failed to batch generate prompts' },
      { status: 500 }
    )
  }
}