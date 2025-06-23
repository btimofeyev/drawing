import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface ModerationResult {
  flagged: boolean
  categories: {
    sexual: boolean
    hate: boolean
    harassment: boolean
    'self-harm': boolean
    'sexual/minors': boolean
    'hate/threatening': boolean
    'violence/graphic': boolean
    'self-harm/intent': boolean
    'self-harm/instructions': boolean
    'harassment/threatening': boolean
    violence: boolean
  }
  category_scores: {
    sexual: number
    hate: number
    harassment: number
    'self-harm': number
    'sexual/minors': number
    'hate/threatening': number
    'violence/graphic': number
    'self-harm/intent': number
    'self-harm/instructions': number
    'harassment/threatening': number
    violence: number
  }
}

export async function moderateImage(imageUrl: string): Promise<ModerationResult> {
  // Ensure API key is present - fail safely if not
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured - content moderation unavailable')
  }

  try {
    const response = await openai.moderations.create({
      input: imageUrl,
      model: 'omni-moderation-latest'
    })

    return response.results[0]
  } catch (error) {
    // Log error but don't expose details in production
    if (process.env.NODE_ENV === 'development') {
      console.error('OpenAI moderation error:', error)
    }
    // Return safe failsafe result that rejects content
    return createFailsafeModerationResult()
  }
}

function createFailsafeModerationResult(): ModerationResult {
  // CRITICAL FIX: When moderation fails, reject content by setting ALL categories to true
  // This ensures child safety by defaulting to the most restrictive state
  const categories = Object.keys({
    sexual: true,
    hate: true,
    harassment: true,
    'self-harm': true,
    'sexual/minors': true,
    'hate/threatening': true,
    'violence/graphic': true,
    'self-harm/intent': true,
    'self-harm/instructions': true,
    'harassment/threatening': true,
    violence: true
  })
  
  return {
    flagged: true,
    categories: categories.reduce((acc, key) => ({ ...acc, [key]: true }), {} as any),
    category_scores: categories.reduce((acc, key) => ({ ...acc, [key]: 1.0 }), {} as any)
  }
}

export function shouldApproveForChildren(moderation: ModerationResult): boolean {
  const strictCategories = [
    'sexual',
    'sexual/minors',
    'violence',
    'violence/graphic',
    'self-harm',
    'self-harm/intent',
    'self-harm/instructions'
  ]

  for (const category of strictCategories) {
    if (moderation.categories[category as keyof typeof moderation.categories]) {
      return false
    }
  }

  const scoreThresholds = {
    sexual: 0.3,
    'sexual/minors': 0.1,
    violence: 0.4,
    'violence/graphic': 0.3,
    'self-harm': 0.3,
    'self-harm/intent': 0.3,
    'self-harm/instructions': 0.3,
    harassment: 0.5,
    'harassment/threatening': 0.4,
    hate: 0.5,
    'hate/threatening': 0.4
  }

  for (const [category, threshold] of Object.entries(scoreThresholds)) {
    if (moderation.category_scores[category as keyof typeof moderation.category_scores] > threshold) {
      return false
    }
  }

  return !moderation.flagged
}