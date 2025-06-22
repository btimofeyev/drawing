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
  try {
    const response = await openai.moderations.create({
      input: imageUrl,
      model: 'omni-moderation-latest'
    })

    return response.results[0]
  } catch (error) {
    console.error('OpenAI moderation error:', error)
    return createFailsafeModerationResult()
  }
}

function createFailsafeModerationResult(): ModerationResult {
  const categories = Object.keys({
    sexual: false,
    hate: false,
    harassment: false,
    'self-harm': false,
    'sexual/minors': false,
    'hate/threatening': false,
    'violence/graphic': false,
    'self-harm/intent': false,
    'self-harm/instructions': false,
    'harassment/threatening': false,
    violence: false
  })
  
  return {
    flagged: true,
    categories: categories.reduce((acc, key) => ({ ...acc, [key]: false }), {} as any),
    category_scores: categories.reduce((acc, key) => ({ ...acc, [key]: 0 }), {} as any)
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