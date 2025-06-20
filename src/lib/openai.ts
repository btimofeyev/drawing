import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface PromptRequest {
  ageGroup: 'kids' | 'tweens'
  difficulty: 'easy' | 'medium' | 'hard'
  theme?: string
  previousPrompts?: string[]
}

export interface GeneratedPrompt {
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  ageGroup: 'kids' | 'tweens'
  emoji: string
}

export class PromptGenerator {
  static async generateDailyPrompt(request: PromptRequest): Promise<GeneratedPrompt> {
    const { ageGroup, difficulty, theme, previousPrompts } = request

    // Create age-appropriate instructions
    const ageInstructions = ageGroup === 'kids' 
      ? "for children ages 6-10. Use simple language, focus on fun and imagination, include animals, fantasy, or everyday objects they know."
      : "for tweens ages 11-16. Use more sophisticated language, include creative challenges that let them express personality and interests."

    const difficultyInstructions = {
      easy: "Simple concepts that can be drawn with basic shapes and colors. Should take 15-30 minutes.",
      medium: "More detailed concepts requiring some planning and multiple elements. Should take 30-60 minutes.",
      hard: "Complex concepts requiring creativity, storytelling, and advanced techniques. Should take 60+ minutes."
    }

    const systemPrompt = `You are a creative art teacher designing daily drawing prompts for children. Create engaging, safe, and inspiring prompts that encourage creativity and self-expression.

Guidelines:
- Always child-safe and positive
- Encourage imagination and creativity  
- Avoid scary, violent, or inappropriate themes
- Make prompts specific enough to provide direction but open enough for personal interpretation
- Include encouraging language

Age group: ${ageGroup} (${ageInstructions})
Difficulty: ${difficulty} (${difficultyInstructions[difficulty]})
${theme ? `Theme preference: ${theme}` : ''}
${previousPrompts?.length ? `Avoid repeating these recent prompts: ${previousPrompts.join(', ')}` : ''}

Return a JSON object with:
- title: A catchy, short title (max 6 words)
- description: A detailed, encouraging prompt (2-3 sentences)
- emoji: One relevant emoji
- difficulty: "${difficulty}"
- ageGroup: "${ageGroup}"`

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate a creative drawing prompt." }
        ],
        temperature: 0.8,
        max_tokens: 300
      })

      const response = completion.choices[0].message.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      const promptData = JSON.parse(response) as GeneratedPrompt
      
      // Validate required fields
      if (!promptData.title || !promptData.description || !promptData.emoji) {
        throw new Error('Invalid prompt format from OpenAI')
      }

      return promptData
    } catch (error) {
      console.error('OpenAI prompt generation failed:', error)
      
      // Fallback to hardcoded prompts
      return this.getFallbackPrompt(request)
    }
  }

  static getFallbackPrompt(request: PromptRequest): GeneratedPrompt {
    const { ageGroup, difficulty } = request

    const fallbackPrompts = {
      kids: {
        easy: {
          title: "Happy Animal Friend",
          description: "Draw your favorite animal wearing a colorful hat! What kind of hat would they choose? Make them look super happy and friendly.",
          emoji: "🐾"
        },
        medium: {
          title: "Magical Garden Adventure", 
          description: "Create a secret garden where flowers have faces and butterflies are rainbow colored! What magical creatures live there? Draw yourself exploring this amazing place.",
          emoji: "🌸"
        },
        hard: {
          title: "Superhero Pet Story",
          description: "Design a superhero pet with special powers! What do they look like? What's their costume? Draw a comic strip showing them saving the day in your neighborhood.",
          emoji: "🦸"
        }
      },
      tweens: {
        easy: {
          title: "Dream Room Design",
          description: "Sketch your perfect bedroom with all your favorite things! Include your ideal furniture, decorations, and any cool gadgets you'd want.",
          emoji: "🏠"
        },
        medium: {
          title: "Future City Explorer",
          description: "Imagine a city 100 years from now! What would the buildings, transportation, and technology look like? Draw yourself as a teen exploring this futuristic world.",
          emoji: "🏙️"
        },
        hard: {
          title: "Emotion Portrait Series",
          description: "Create a series of self-portraits showing different emotions through art style, colors, and surroundings. How can you show happiness vs. excitement vs. determination through your artistic choices?",
          emoji: "🎭"
        }
      }
    }

    const prompt = fallbackPrompts[ageGroup][difficulty]
    
    return {
      ...prompt,
      difficulty,
      ageGroup
    }
  }

  static async generateWeeklyPrompts(ageGroup: 'kids' | 'tweens'): Promise<GeneratedPrompt[]> {
    const prompts: GeneratedPrompt[] = []
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'easy', 'medium', 'medium', 'hard', 'medium', 'easy']
    
    for (let i = 0; i < 7; i++) {
      const prompt = await this.generateDailyPrompt({
        ageGroup,
        difficulty: difficulties[i],
        previousPrompts: prompts.map(p => p.title)
      })
      prompts.push(prompt)
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return prompts
  }
}