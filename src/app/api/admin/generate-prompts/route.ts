import { NextRequest, NextResponse } from 'next/server'
import { PromptGenerator } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, ageGroups = ['kids', 'tweens'] } = body

    // Validate date
    const targetDate = date ? new Date(date) : new Date()
    const dateStr = targetDate.toISOString().split('T')[0]

    console.log(`Generating prompts for ${dateStr}`)

    const generatedPrompts = []

    for (const ageGroup of ageGroups) {
      // Check if prompts already exist for this date/age group
      const { data: existing } = await supabaseAdmin
        .from('prompts')
        .select('*')
        .eq('date', dateStr)
        .eq('age_group', ageGroup)

      if (existing && existing.length > 0) {
        console.log(`Prompts already exist for ${ageGroup} on ${dateStr}`)
        generatedPrompts.push(...existing)
        continue
      }

      // Generate prompts for each time slot
      const timeSlots: ('morning' | 'afternoon' | 'evening')[] = ['morning', 'afternoon', 'evening']
      
      for (const timeSlot of timeSlots) {
        try {
          console.log(`Generating ${timeSlot} prompt for ${ageGroup}`)
          
          const prompt = await PromptGenerator.generateSlotPrompt({
            ageGroup,
            timeSlot
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
            console.log(`✅ Stored ${timeSlot} prompt for ${ageGroup}`)
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