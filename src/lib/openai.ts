import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export type TimeSlot = 'morning' | 'afternoon' | 'evening'

export interface PromptRequest {
  ageGroup: 'kids' | 'tweens'
  difficulty: 'easy' | 'medium' | 'hard'
  timeSlot?: TimeSlot
  theme?: string
  previousPrompts?: string[]
}

export interface GeneratedPrompt {
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  ageGroup: 'kids' | 'tweens'
  timeSlot?: TimeSlot
  emoji: string
}

export class PromptGenerator {
  // Generate slot-specific prompt with time-based themes
  static async generateSlotPrompt(request: PromptRequest): Promise<GeneratedPrompt> {
    const { ageGroup, timeSlot, previousPrompts } = request
    
    if (!timeSlot) {
      throw new Error('timeSlot is required for generateSlotPrompt')
    }

    // Time slot specific themes and difficulty
    const slotConfig = this.getSlotConfig(timeSlot)
    
    return this.generateDailyPrompt({
      ...request,
      difficulty: slotConfig.difficulty,
      theme: slotConfig.theme,
      previousPrompts
    })
  }

  // Get configuration for each time slot
  static getSlotConfig(timeSlot: TimeSlot) {
    const configs = {
      morning: {
        difficulty: 'easy' as const,
        theme: 'Fresh starts, breakfast foods, morning sunshine, gentle animals, waking up activities, peaceful nature scenes',
        color: '#FF6B6B', // Warm morning red
        description: 'Start your day with creativity!'
      },
      afternoon: {
        difficulty: 'medium' as const, 
        theme: 'Adventure and exploration, outdoor activities, friendship, playing games, sports, traveling, active scenes',
        color: '#4ECDC4', // Energetic teal
        description: 'Time for adventure and exploration!'
      },
      evening: {
        difficulty: 'hard' as const,
        theme: 'Reflection and dreams, cozy indoor activities, storytelling, imagination, fantasy worlds, bedtime scenes, starry skies',
        color: '#45B7D1', // Calm evening blue
        description: 'Wind down with thoughtful creativity!'
      }
    }
    
    return configs[timeSlot]
  }

  static async generateDailyPrompt(request: PromptRequest): Promise<GeneratedPrompt> {
    const { ageGroup, difficulty, timeSlot, theme, previousPrompts } = request

    // Create age-appropriate instructions
    const ageInstructions = ageGroup === 'kids' 
      ? "for children ages 6-10. Use simple language, focus on fun and imagination, include animals, fantasy, or everyday objects they know."
      : "for tweens ages 11-16. Use more sophisticated language, include creative challenges that let them express personality and interests."

    const difficultyInstructions = {
      easy: "Simple concepts that can be drawn with basic shapes and colors. Should take 15-30 minutes.",
      medium: "More detailed concepts requiring some planning and multiple elements. Should take 30-60 minutes.",
      hard: "Complex concepts requiring creativity, storytelling, and advanced techniques. Should take 60+ minutes."
    }

    const timeSlotContext = timeSlot ? this.getSlotConfig(timeSlot) : null
    
    const systemPrompt = `You are a creative art teacher designing daily drawing prompts for children. Create engaging, safe, and inspiring prompts that encourage creativity and self-expression.

Guidelines:
- Always child-safe and positive
- Encourage imagination and creativity  
- Avoid scary, violent, or inappropriate themes
- Make prompts specific enough to provide direction but open enough for personal interpretation
- Include encouraging language

Age group: ${ageGroup} (${ageInstructions})
Difficulty: ${difficulty} (${difficultyInstructions[difficulty]})
${timeSlot ? `Time slot: ${timeSlot} - ${timeSlotContext?.description}` : ''}
${theme ? `Theme preference: ${theme}` : ''}
${previousPrompts?.length ? `Avoid repeating these recent prompts: ${previousPrompts.join(', ')}` : ''}

Return a JSON object with:
- title: A catchy, short title (max 6 words)
- description: A detailed, encouraging prompt (2-3 sentences)
- emoji: One relevant emoji
- difficulty: "${difficulty}"
- ageGroup: "${ageGroup}"
${timeSlot ? `- timeSlot: "${timeSlot}"` : ''}`

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

      // Clean the response to remove markdown formatting
      let cleanResponse = response.trim()
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/```\s*$/, '')
      }
      if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/```\s*$/, '')
      }

      const promptData = JSON.parse(cleanResponse) as GeneratedPrompt
      
      // Validate required fields
      if (!promptData.title || !promptData.description || !promptData.emoji) {
        throw new Error('Invalid prompt format from OpenAI')
      }

      // Ensure timeSlot is included
      if (timeSlot) {
        promptData.timeSlot = timeSlot
      }

      return promptData
    } catch (error) {
      console.error('OpenAI prompt generation failed:', error)
      
      // Fallback to hardcoded prompts
      return this.getFallbackPrompt(request)
    }
  }

  static getFallbackPrompt(request: PromptRequest): GeneratedPrompt {
    const { ageGroup, difficulty, timeSlot } = request

    // Time slot specific fallback prompts
    const slotFallbacks = {
      morning: {
        kids: {
          easy: { title: "Sunny Breakfast Party", description: "Draw your favorite breakfast foods having a morning party! What would pancakes, eggs, and fruit do when they wake up?", emoji: "☀️" },
          medium: { title: "Morning Animal Friends", description: "Create a scene of forest animals starting their morning! Show a rabbit brushing teeth or a bird stretching wings.", emoji: "🐰" },
          hard: { title: "Sunrise Adventure Story", description: "Tell a story through art about the first rays of sunshine! What magical things happen when the world wakes up?", emoji: "🌅" }
        },
        tweens: {
          easy: { title: "Morning Vibes", description: "Design your ideal morning routine using colors and shapes to show how you want to feel when you wake up.", emoji: "🎨" },
          medium: { title: "Dawn Cityscape", description: "Draw a city coming to life at dawn! Show buildings, early commuters, and the golden light of morning.", emoji: "🌇" },
          hard: { title: "New Day Symbolism", description: "Create artwork that symbolizes new beginnings and fresh starts using symbols and personal meaning.", emoji: "✨" }
        }
      },
      afternoon: {
        kids: {
          easy: { title: "Playground Adventure", description: "Draw yourself playing at your favorite playground! Include swings, slides, and maybe some new friends.", emoji: "🛝" },
          medium: { title: "Outdoor Explorer", description: "Create an adventure scene where you're exploring a forest or beach! What interesting things do you discover?", emoji: "🏕️" },
          hard: { title: "Sports Team Action", description: "Design your own sports team and draw them in action! What sport do they play? Show the excitement!", emoji: "⚽" }
        },
        tweens: {
          easy: { title: "Friendship Portrait", description: "Draw you and your friends hanging out! Show what makes your friendship special.", emoji: "👥" },
          medium: { title: "Adventure Map", description: "Create a detailed map of an imaginary adventure location with landmarks and hidden treasures.", emoji: "🗺️" },
          hard: { title: "Dynamic Movement", description: "Capture movement and energy! Draw dancers, athletes, or any scene full of action and motion.", emoji: "💨" }
        }
      },
      evening: {
        kids: {
          easy: { title: "Cozy Reading Corner", description: "Draw your perfect cozy spot for reading books! Include soft pillows, warm blankets, and maybe a pet.", emoji: "📚" },
          medium: { title: "Dream Castle", description: "Design a magical castle that exists only in dreams! What rooms would it have? Make it sparkle!", emoji: "🏰" },
          hard: { title: "Bedtime Story Scene", description: "Create an illustration for your favorite bedtime story! Show the magical moment when dreams meet reality.", emoji: "🌙" }
        },
        tweens: {
          easy: { title: "Evening Sky Study", description: "Draw the evening sky with all its beautiful colors! Include clouds and the peaceful feeling of day ending.", emoji: "🌆" },
          medium: { title: "Introspective Self", description: "Create a thoughtful self-portrait that shows your inner world through colors and symbols.", emoji: "🤔" },
          hard: { title: "Fantasy World Building", description: "Design an entire fantasy world with its own rules, creatures, and landscapes!", emoji: "🔮" }
        }
      }
    }

    // Default fallbacks if no time slot
    const generalFallbacks = {
      kids: {
        easy: { title: "Happy Animal Friend", description: "Draw your favorite animal wearing a colorful hat! Make them look super happy and friendly.", emoji: "🐾" },
        medium: { title: "Magical Garden", description: "Create a secret garden where flowers have faces and butterflies are rainbow colored!", emoji: "🌸" },
        hard: { title: "Superhero Pet Story", description: "Design a superhero pet with special powers! Draw them saving the day!", emoji: "🦸" }
      },
      tweens: {
        easy: { title: "Dream Room Design", description: "Sketch your perfect bedroom with all your favorite things and cool gadgets.", emoji: "🏠" },
        medium: { title: "Future City Explorer", description: "Imagine a city 100 years from now! What would the buildings and technology look like?", emoji: "🏙️" },
        hard: { title: "Emotion Portrait", description: "Create a self-portrait that shows different emotions through art style and colors.", emoji: "🎭" }
      }
    }

    let prompt
    if (timeSlot && slotFallbacks[timeSlot]) {
      prompt = slotFallbacks[timeSlot][ageGroup][difficulty]
    } else {
      prompt = generalFallbacks[ageGroup][difficulty]
    }
    
    return {
      ...prompt,
      difficulty,
      ageGroup,
      timeSlot
    }
  }

  // Generate 3 prompts for all time slots for a specific day
  static async generateDailySlots(ageGroup: 'kids' | 'tweens', previousPrompts?: string[]): Promise<GeneratedPrompt[]> {
    const slots: TimeSlot[] = ['morning', 'afternoon', 'evening']
    const prompts: GeneratedPrompt[] = []
    
    for (const timeSlot of slots) {
      const prompt = await this.generateSlotPrompt({
        ageGroup,
        timeSlot,
        previousPrompts: [...(previousPrompts || []), ...prompts.map(p => p.title)]
      })
      prompts.push(prompt)
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return prompts
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