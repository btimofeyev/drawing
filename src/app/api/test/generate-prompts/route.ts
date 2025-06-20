import { NextRequest, NextResponse } from 'next/server'
import { PromptGenerator } from '@/lib/openai'

// Test endpoint to verify the new themed prompt generation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ageGroup = searchParams.get('ageGroup') as 'kids' | 'tweens' | null

    if (!ageGroup || !['kids', 'tweens'].includes(ageGroup)) {
      return NextResponse.json(
        { error: 'Valid ageGroup (kids or tweens) is required' },
        { status: 400 }
      )
    }

    console.log(`Testing MVP community prompt generation for ${ageGroup}...`)

    // Test the new generateMVPCommunityPrompts function
    const prompts = await PromptGenerator.generateMVPCommunityPrompts(ageGroup)

    return NextResponse.json({
      success: true,
      ageGroup,
      prompts: prompts.map(prompt => ({
        timeSlot: prompt.timeSlot,
        title: prompt.title,
        description: prompt.description,
        communityTitle: prompt.communityTitle,
        emoji: prompt.emoji,
        difficulty: prompt.difficulty
      })),
      message: `Successfully generated ${prompts.length} themed prompts for ${ageGroup}`
    })
  } catch (error) {
    console.error('Error testing prompt generation:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate test prompts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}