import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export type TimeSlot = 'daily_1' | 'daily_2' | 'free_draw'

export interface PromptRequest {
  ageGroup: 'preschoolers' | 'kids' | 'tweens'
  difficulty: 'easy' | 'medium' | 'hard'
  timeSlot?: TimeSlot
  theme?: string
  previousPrompts?: string[]
}

export interface GeneratedPrompt {
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  ageGroup: 'preschoolers' | 'kids' | 'tweens'
  timeSlot?: TimeSlot
  emoji: string
  category: 'real_life' | 'nature' | 'imagination' | 'personal' | 'seasonal' | 'current_events'
}

export class ImprovedPromptGenerator {
  // Diverse theme categories with weight-based selection
  static getThemeCategories(ageGroup: string) {
    const categories = {
      preschoolers: {
        real_life: {
          weight: 40,
          themes: [
            "things you did today", "favorite foods", "your room", "playing with friends",
            "helping at home", "pets and animals you know", "your family", "toys you love",
            "places you go", "your favorite clothes", "snack time", "bedtime routine"
          ]
        },
        nature: {
          weight: 25,
          themes: [
            "animals at the zoo", "flowers in the garden", "rainy days", "sunny weather",
            "bugs you've seen", "trees and leaves", "birds outside", "your favorite season"
          ]
        },
        imagination: {
          weight: 20,
          themes: [
            "silly animals", "funny faces", "made-up creatures", "colorful monsters",
            "flying things", "underwater adventures", "space rockets", "magic tricks"
          ]
        },
        seasonal: {
          weight: 15,
          themes: ["holidays you celebrate", "birthday parties", "summer fun", "winter activities"]
        }
      },
      kids: {
        real_life: {
          weight: 35,
          themes: [
            "last weekend's adventure", "your best friend", "favorite school subject", "family traditions",
            "sports you play", "instruments or hobbies", "your neighborhood", "cooking together",
            "movie night", "road trips", "your dream bedroom", "helping others", "school lunch",
            "recess games", "your talents", "chores you don't mind", "after school activities"
          ]
        },
        personal: {
          weight: 25,
          themes: [
            "when you felt proud", "overcoming a challenge", "your goals", "what makes you unique",
            "your personality in colors", "your superhero alter-ego", "your time capsule",
            "things that make you laugh", "your comfort zone vs adventure zone"
          ]
        },
        nature: {
          weight: 20,
          themes: [
            "sunset you remember", "ocean or lake visits", "hiking trails", "camping experiences",
            "wildlife you've spotted", "storms you've watched", "your garden or plants",
            "environmental changes", "outdoor photography", "beach discoveries"
          ]
        },
        imagination: {
          weight: 15,
          themes: [
            "time travel destinations", "invention ideas", "mystery solving", "alternative history",
            "what if scenarios", "future technology", "cartoon physics", "dream job mashups"
          ]
        },
        current_events: {
          weight: 5,
          themes: ["community events", "seasonal celebrations", "local changes", "new discoveries"]
        }
      },
      tweens: {
        personal: {
          weight: 30,
          themes: [
            "your evolving identity", "friend group dynamics", "crush experiences", "social media life",
            "academic pressures", "future aspirations", "values you hold", "generation differences",
            "peer influence", "independence vs support", "body changes", "emotional complexity"
          ]
        },
        real_life: {
          weight: 25,
          themes: [
            "weekend hangouts", "school social scenes", "family relationships", "part-time jobs",
            "extracurricular commitments", "technology in daily life", "fashion choices",
            "music and entertainment", "food culture", "local community", "transportation freedom"
          ]
        },
        current_events: {
          weight: 20,
          themes: [
            "social justice issues", "environmental concerns", "technology trends", "global events",
            "cultural movements", "political awareness", "economic impacts", "scientific breakthroughs"
          ]
        },
        imagination: {
          weight: 15,
          themes: [
            "dystopian/utopian futures", "alternate realities", "creative writing inspiration",
            "philosophical questions", "ethical dilemmas", "artistic interpretations", "abstract concepts"
          ]
        },
        nature: {
          weight: 10,
          themes: [
            "climate change effects", "conservation efforts", "outdoor adventures", "natural phenomena",
            "wildlife photography", "gardening projects", "environmental activism"
          ]
        }
      }
    }
    
    return categories[ageGroup as keyof typeof categories] || categories.kids
  }

  // Get current season and relevant themes
  static getCurrentSeasonalThemes(): string[] {
    const now = new Date()
    const month = now.getMonth() + 1
    
    if (month >= 3 && month <= 5) {
      return ["spring flowers blooming", "rainy day activities", "Easter celebrations", "outdoor picnics"]
    } else if (month >= 6 && month <= 8) {
      return ["summer vacation", "beach trips", "ice cream treats", "outdoor games", "camping adventures"]
    } else if (month >= 9 && month <= 11) {
      return ["back to school", "autumn leaves", "Halloween costumes", "harvest time", "cozy sweaters"]
    } else {
      return ["winter holidays", "snow activities", "hot cocoa", "New Year resolutions", "indoor crafts"]
    }
  }

  // Select theme based on weighted random selection
  static selectWeightedTheme(ageGroup: string, previousPrompts: string[] = []): { category: string, theme: string } {
    const categories = this.getThemeCategories(ageGroup)
    const recentCategories = previousPrompts.slice(-5) // Check last 5 prompts for variety
    
    // Calculate total weight, reducing weight for recently used categories
    let totalWeight = 0
    const adjustedCategories = Object.entries(categories).map(([category, data]) => {
      const recentUse = recentCategories.filter(p => p.includes(category)).length
      const adjustedWeight = Math.max(data.weight - (recentUse * 10), 5) // Minimum weight of 5
      totalWeight += adjustedWeight
      return { category, themes: data.themes, weight: adjustedWeight }
    })
    
    // Select category
    let random = Math.random() * totalWeight
    let selectedCategory = adjustedCategories[0]
    
    for (const cat of adjustedCategories) {
      if (random <= cat.weight) {
        selectedCategory = cat
        break
      }
      random -= cat.weight
    }
    
    // Select theme from category
    const theme = selectedCategory.themes[Math.floor(Math.random() * selectedCategory.themes.length)]
    
    return { category: selectedCategory.category, theme }
  }

  static async generateDailyPrompt(request: PromptRequest): Promise<GeneratedPrompt> {
    const { ageGroup, difficulty, timeSlot, previousPrompts = [] } = request
    
    // Select theme with variety
    const { category, theme } = this.selectWeightedTheme(ageGroup, previousPrompts)
    const seasonalThemes = this.getCurrentSeasonalThemes()
    
    // Age-specific instruction improvements
    const ageInstructions = {
      preschoolers: "Create prompts using very simple language for ages 4-6. Focus on big shapes, bright colors, and things they know well. Encourage basic motor skills and creativity.",
      kids: "Create engaging prompts for ages 7-10. Mix real experiences with creative twists. Use encouraging language and include specific but flexible details.",
      tweens: "Create meaningful prompts for ages 11-16. Address their interests, social world, and growing independence. Include emotional depth and personal expression opportunities."
    }

    // Enhanced developer instructions with better examples
    const developerInstructions = `# Advanced Children's Art Prompt Creator

## Your Role
You're an expert art educator who understands child development and creates prompts that genuinely excite kids about drawing.

## Core Principles
- **Authentic Connection**: Root prompts in real experiences kids actually have
- **Creative Flexibility**: Give direction without limiting imagination  
- **Emotional Engagement**: Tap into feelings, memories, and personal interests
- **Age Appropriateness**: ${ageInstructions[ageGroup as keyof typeof ageInstructions]}

## Theme Guidelines
**Selected Category**: ${category}
**Specific Theme**: ${theme}
**Current Season**: Consider these seasonal elements: ${seasonalThemes.join(', ')}

## Content Strategy
### GREAT Prompt Types:
- Personal experiences: "Draw your actual bedroom but add one magical element"
- Real + Creative: "Draw your family as different animals" 
- Emotional: "Draw what happiness looks like in your house"
- Specific scenarios: "Draw the view from your bedroom window at sunset"
- Relatable challenges: "Draw yourself teaching someone something you're good at"

### AVOID These Overused Concepts:
- Generic magical forests or enchanted places
- Perfect/dream versions of everything  
- "Amazing" and "incredible" descriptions
- Vague fantasy without personal connection

## Format Requirements
Return ONLY valid JSON:
{
  "title": "Engaging title (max 6 words)",
  "description": "2-3 sentences with specific, inspiring guidance", 
  "emoji": "relevant emoji",
  "difficulty": "${difficulty}",
  "ageGroup": "${ageGroup}",
  "category": "${category}"
}

## Example Transformations

❌ Bad: "Draw your dream treehouse with magical features!"
✅ Good: "Draw a treehouse in your backyard where you and your best friend have secret meetings. What would you keep up there?"

❌ Bad: "Imagine the most amazing forest ever!"  
✅ Good: "Draw the woods behind your school but show what the animals there do when kids go home."

❌ Bad: "Create your perfect magical pet!"
✅ Good: "Draw your actual pet (or neighbor's pet) having a conversation with you. What would they say?"

Now create an inspiring prompt using the theme "${theme}" that kids will actually want to draw.`

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "developer", content: developerInstructions },
          { role: "user", content: `Create a fresh, engaging drawing prompt about "${theme}" that avoids overused fantasy tropes.` }
        ],
        temperature: 0.8,
        max_tokens: 400,
        response_format: { type: "json_object" }
      })

      const response = completion.choices[0].message.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      const promptData = JSON.parse(response) as GeneratedPrompt
      
      // Validate and ensure correct metadata
      if (!promptData.title || !promptData.description || !promptData.emoji) {
        throw new Error('Invalid prompt format from OpenAI')
      }

      promptData.difficulty = difficulty
      promptData.ageGroup = ageGroup
      promptData.category = category as any
      if (timeSlot) {
        promptData.timeSlot = timeSlot
      }

      return promptData

    } catch (error) {
      console.error('OpenAI prompt generation failed:', error)
      return this.getFallbackPrompt(request, category, theme)
    }
  }

  // Diverse fallback prompts by category
  static getFallbackPrompt(request: PromptRequest, category: string, theme: string): GeneratedPrompt {
    const { ageGroup, difficulty, timeSlot } = request

    const fallbackPrompts = {
      preschoolers: {
        real_life: [
          { title: "My Breakfast Today", description: "Draw what you ate for breakfast this morning! Show your plate, cup, and maybe who ate with you. Use your favorite colors!", emoji: "🥞" },
          { title: "Playing Outside", description: "Draw yourself playing your favorite game outside! Maybe on a swing, with a ball, or running around. Show how happy you are!", emoji: "⚽" },
          { title: "My Pet Friend", description: "Draw a pet you have or would like to have! Show what they like to do and how they make you smile.", emoji: "🐕" }
        ],
        nature: [
          { title: "Birds I See", description: "Draw birds you've seen outside! Maybe at your window, in trees, or eating bread. Give them bright colors!", emoji: "🐦" },
          { title: "Rainy Day Fun", description: "Draw what you do when it rains! Maybe look out the window, splash in puddles, or stay cozy inside.", emoji: "🌧️" }
        ],
        imagination: [
          { title: "Silly Animal Mix", description: "Draw an animal but give it something funny! Maybe a dog with butterfly wings or a cat with stripes like a zebra!", emoji: "🦋" },
          { title: "Flying Food", description: "Draw your favorite food flying around! What if pizza could fly or apples had wings? Make it colorful and fun!", emoji: "🍕" }
        ]
      },
      kids: {
        real_life: [
          { title: "Last Weekend Adventure", description: "Draw something fun you actually did last weekend! Maybe a trip, game, meal, or time with family. Include the details you remember best!", emoji: "🎮" },
          { title: "School Lunch Scene", description: "Draw yourself and friends at lunch time! Show what you're eating, who you sit with, and the conversations happening around you.", emoji: "🍎" },
          { title: "After School Routine", description: "Draw what you do right after school! Show your backpack, snack, homework spot, or activities. Include how you feel when you get home.", emoji: "🎒" }
        ],
        personal: [
          { title: "Teaching Someone", description: "Draw yourself teaching a friend or family member something you're really good at! Show both people and the proud feeling of sharing knowledge.", emoji: "🏆" },
          { title: "Your Personality Colors", description: "Draw yourself using colors that match your personality! If you're energetic, use bright colors. If you're calm, use soft ones. Show what makes you YOU!", emoji: "🎨" }
        ],
        nature: [
          { title: "Sunset From Memory", description: "Draw a sunset you actually remember seeing! Maybe from your window, a car ride, or vacation. Include where you were and who was with you.", emoji: "🌅" },
          { title: "Weather You Love", description: "Draw your favorite type of weather and yourself enjoying it! Show what you like to do when the weather is just right.", emoji: "☀️" }
        ]
      },
      tweens: {
        personal: [
          { title: "Identity Collage", description: "Draw a creative representation of who you are using symbols, colors, and images that represent your interests, values, and personality.", emoji: "🎭" },
          { title: "Social Dynamics", description: "Draw a scene showing different friend groups at school and where you fit in. Show the complexity of social relationships honestly.", emoji: "👥" }
        ],
        real_life: [
          { title: "Technology Balance", description: "Draw how technology fits into your daily life. Show both positive and challenging aspects of being connected in today's world.", emoji: "📱" },
          { title: "Weekend Hangout", description: "Draw you and friends hanging out, but focus on the real moments - conversations, inside jokes, and genuine connections rather than activities.", emoji: "🤝" }
        ],
        current_events: [
          { title: "Environmental Action", description: "Draw yourself taking action on an environmental issue you care about. Show what small changes can make a difference.", emoji: "🌱" },
          { title: "Community Change", description: "Draw a positive change you'd like to see in your community and yourself being part of making it happen.", emoji: "🏘️" }
        ]
      }
    }

    const ageFallbacks = fallbackPrompts[ageGroup as keyof typeof fallbackPrompts]
    const categoryFallbacks = ageFallbacks[category as keyof typeof ageFallbacks] || ageFallbacks.real_life
    const randomPrompt = categoryFallbacks[Math.floor(Math.random() * categoryFallbacks.length)]

    return {
      ...randomPrompt,
      difficulty,
      ageGroup,
      timeSlot,
      category: category as any
    }
  }

  // Generate varied prompts for time slots
  static async generateDailySlots(ageGroup: 'kids' | 'tweens', previousPrompts?: string[]): Promise<GeneratedPrompt[]> {
    const slots: TimeSlot[] = ['daily_1', 'daily_2', 'free_draw']
    const prompts: GeneratedPrompt[] = []
    const usedCategories: string[] = []
    
    for (const timeSlot of slots) {
      // Ensure variety across time slots
      const { category } = this.selectWeightedTheme(ageGroup, [...(previousPrompts || []), ...usedCategories])
      usedCategories.push(category)
      
      const prompt = await this.generateDailyPrompt({
        ageGroup,
        timeSlot,
        difficulty: timeSlot === 'daily_1' ? 'easy' : 'medium',
        previousPrompts: [...(previousPrompts || []), ...prompts.map(p => p.title)]
      })
      
      prompts.push(prompt)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return prompts
  }
}