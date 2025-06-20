import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export type TimeSlot = 'daily_1' | 'daily_2' | 'free_draw'

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

  // Generate shared daily prompt that everyone gets
  static async generateSharedDailyPrompt(request: PromptRequest): Promise<GeneratedPrompt & { communityTitle: string }> {
    const { ageGroup, previousPrompts, theme } = request

    // Create age-appropriate instructions using structured prompting
    const ageInstructions = ageGroup === 'kids' 
      ? "children ages 6-10. Focus on real-life experiences, everyday activities, nature, pets, family, school, sports, and things they see around them. Use simple, encouraging language."
      : "tweens ages 11-16. Focus on realistic scenarios, hobbies, interests, social situations, future aspirations, and personal experiences. Include creative challenges that allow self-expression."
    
    // Build structured developer message for shared prompts
    const themeInstruction = theme === 'nature' 
      ? 'Create a NATURE drawing prompt about animals, plants, weather, seasons, or landscapes.'
      : theme === 'imagination'
      ? 'Create an IMAGINATION drawing prompt about magical creatures, inventions, fantasy, or superheroes.'
      : 'Create a REAL LIFE drawing prompt about family, home, food, pets, or favorite things.'

    const ageInstruction = ageGroup === 'kids'
      ? 'For children aged 6-10. Keep it simple, playful and easy to understand.'
      : 'For tweens aged 11-16. Make it engaging with more creative challenges.'

    const developerInstructions = `${themeInstruction}

${ageInstruction}

Make it fun and creative. Avoid anything scary or inappropriate.

JSON format:
{
  "title": "Title (max 6 words)",
  "description": "Fun description of what to draw",
  "communityTitle": "🌟 Our [Topic] Collection!",
  "emoji": "😊", 
  "difficulty": "medium",
  "ageGroup": "${ageGroup}"
}`

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "developer", content: developerInstructions },
          { role: "user", content: "Create a new shared daily prompt that will inspire amazing community artwork." }
        ],
        temperature: 1.0,
        max_tokens: 500,
        response_format: { type: "json_object" }
      })

      const response = completion.choices[0].message.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      const promptData = JSON.parse(response) as GeneratedPrompt & { communityTitle: string }
      
      // Validate required fields
      if (!promptData.title || !promptData.description || !promptData.emoji || !promptData.communityTitle) {
        throw new Error('Invalid shared prompt format from OpenAI')
      }

      // Ensure correct metadata
      promptData.difficulty = 'medium'
      promptData.ageGroup = ageGroup

      return promptData
    } catch (error) {
      console.error('OpenAI shared prompt generation failed:', error)
      
      // Fallback to hardcoded shared prompts
      return this.getFallbackSharedPrompt({ ageGroup, difficulty: 'medium' })
    }
  }

  // Get configuration for each time slot
  static getSlotConfig(timeSlot: TimeSlot) {
    const configs = {
      daily_1: {
        difficulty: 'easy' as const,
        theme: 'Fun adventures, amazing animals, dream vacations, favorite foods, happy families, magical places, your best day ever',
        color: '#FF6B6B', // Warm red
        description: 'First daily challenge - easy and fun!'
      },
      daily_2: {
        difficulty: 'medium' as const, 
        theme: 'Creative inventions, future dreams, friendship adventures, exploring new places, solving problems, helping others, amazing discoveries',
        color: '#4ECDC4', // Energetic teal
        description: 'Second daily challenge - more detailed!'
      },
      free_draw: {
        difficulty: 'easy' as const,
        theme: 'Draw anything your heart desires! Express yourself freely with no limits.',
        color: '#45B7D1', // Creative blue
        description: 'Free draw - unleash your creativity!'
      }
    }
    
    return configs[timeSlot]
  }

  static async generateDailyPrompt(request: PromptRequest): Promise<GeneratedPrompt> {
    const { ageGroup, difficulty, timeSlot, theme, previousPrompts } = request

    // Create age-appropriate instructions using structured prompting
    const ageInstructions = ageGroup === 'kids' 
      ? "children ages 6-10. Focus on real-life experiences, everyday activities, nature, pets, family, school, sports, and things they see around them. Use simple, encouraging language."
      : "tweens ages 11-16. Focus on realistic scenarios, hobbies, interests, social situations, future aspirations, and personal experiences. Include creative challenges that allow self-expression."

    const timeSlotContext = timeSlot ? this.getSlotConfig(timeSlot) : null
    
    // Build structured developer message with Markdown and XML
    const developerInstructions = `# Identity

You are an expert children's art teacher and creative prompt designer. Your role is to create engaging, safe, and inspiring drawing prompts that spark creativity and build confidence in young artists.

# Instructions

## Core Requirements
* **Safety First**: Always create child-safe, positive, and uplifting prompts
* **Fun & Imaginative**: Blend real-world experiences with creative imagination and "what if" scenarios
* **Age Appropriate**: Design prompts specifically ${ageInstructions}
* **Creativity Focus**: Encourage imagination, wonder, and creative interpretation of real things
* **Skill Building**: Match the complexity to the specified difficulty level
* **Inclusivity**: Ensure prompts work for all backgrounds and abilities

## Content Guidelines
* **Great Topics**: Real animals (but imagine them in fun ways), amazing nature scenes, dream vacations, future aspirations, "what if" scenarios, beautiful versions of real things
* **Creative Twists**: "The most beautiful horse you can imagine", "Your perfect treehouse", "If you could redesign your room", "The most amazing playground"
* **Balance**: Mix realistic drawing with imaginative elements - real subjects with creative interpretation
* **Inspire Wonder**: Prompts should make kids excited about the world around them and dream big

## Difficulty Guidelines
* **Easy**: Simple concepts using basic shapes and colors (15-30 minutes)
* **Medium**: More detailed concepts requiring planning and multiple elements (30-60 minutes)  
* **Hard**: Complex concepts requiring creativity, storytelling, and advanced techniques (60+ minutes)

## Prompt Structure Rules
* Title: Create a catchy, exciting title (maximum 6 words)
* Description: Write 2-3 encouraging sentences that guide without restricting creativity
* Include specific but flexible elements with imaginative twists (e.g., "the most amazing beach you can imagine" or "your dream pet")
* Use action words and emotional language to inspire wonder and excitement
* End with an encouraging question or creative challenge that sparks imagination
* Ground prompts in real things but encourage creative, beautiful, or fun interpretations

## Format Requirements
Respond with ONLY a valid JSON object containing these exact fields:
- title: string (max 6 words)
- description: string (2-3 sentences)
- emoji: string (one relevant emoji)
- difficulty: "${difficulty}"
- ageGroup: "${ageGroup}"
${timeSlot ? `- timeSlot: "${timeSlot}"` : ''}

# Context

<age_group>${ageGroup}</age_group>
<difficulty_level>${difficulty}</difficulty_level>
${timeSlot ? `<time_slot>${timeSlot}</time_slot>
<time_theme>${timeSlotContext?.theme}</time_theme>
<time_description>${timeSlotContext?.description}</time_description>` : ''}
${theme ? `<additional_theme>${theme}</additional_theme>` : ''}
${previousPrompts?.length ? `<avoid_prompts>${previousPrompts.join(', ')}</avoid_prompts>` : ''}

# Examples

<example_request>
Age: kids, Difficulty: easy, Time: morning
</example_request>

<example_response>
{
  "title": "Most Beautiful Sunrise",
  "description": "Draw the most amazing sunrise you can imagine! Maybe there are colorful clouds, birds flying by, or flowers opening up to greet the morning. Add anything that makes you feel happy and excited about a new day! What colors would make the perfect sunrise?",
  "emoji": "🌅",
  "difficulty": "easy",
  "ageGroup": "kids",
  "timeSlot": "morning"
}
</example_response>

<example_request>
Age: tweens, Difficulty: medium, Time: afternoon
</example_request>

<example_response>
{
  "title": "Perfect Beach Day",
  "description": "Imagine you're at the most incredible beach ever! Draw what you see - maybe crystal clear water, interesting shells, fun beach activities, or amazing wildlife. Include yourself having the best time. What would make this the perfect beach day for you?",
  "emoji": "🏖️",
  "difficulty": "medium",
  "ageGroup": "tweens",
  "timeSlot": "afternoon"
}
</example_response>

<example_request>
Age: kids, Difficulty: easy, Time: evening
</example_request>

<example_response>
{
  "title": "Dream Pet Friend",
  "description": "Draw the most amazing pet you can imagine having! It could be a super fluffy cat, a dog with the prettiest fur, or any real animal that would be the perfect companion. Show your pet doing something fun with you! What would make your dream pet special?",
  "emoji": "🐕",
  "difficulty": "easy",
  "ageGroup": "kids",
  "timeSlot": "evening"
}
</example_response>`

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "developer", content: developerInstructions },
          { role: "user", content: "Create a new drawing prompt based on the specified requirements." }
        ],
        temperature: 0.7,
        max_tokens: 400,
        response_format: { type: "json_object" }
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

      // Ensure correct metadata
      promptData.difficulty = difficulty
      promptData.ageGroup = ageGroup
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
      daily_1: {
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
      daily_2: {
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
      free_draw: {
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

  static getFallbackSharedPrompt(request: { ageGroup: 'kids' | 'tweens', difficulty: 'medium' }): GeneratedPrompt & { communityTitle: string } {
    const { ageGroup } = request

    const sharedFallbacks = {
      kids: [
        {
          title: "Dream Pet Adventure",
          description: "Draw the most amazing pet you can imagine going on an adventure with you! It could be a super smart dog, a gentle giant cat, or any real animal that would be the perfect adventure buddy. Show your pet doing something incredible together! What kind of adventure would you go on with your dream pet?",
          communityTitle: "🐾 Everyone's Dream Pet Adventures!",
          emoji: "🐕"
        },
        {
          title: "Perfect Treehouse",
          description: "Design the most incredible treehouse you can imagine! Where would it be? What special rooms or features would it have? Include a rope ladder, windows, maybe even a slide! What would make your treehouse the best place to hang out?",
          communityTitle: "🏠 Amazing Treehouse Designs!",
          emoji: "🌳"
        },
        {
          title: "Magical Garden Discovery",
          description: "Draw a beautiful garden where you discover something amazing! Maybe talking flowers, friendly butterflies, or a hidden fairy door. Show yourself exploring this wonderful place. What would be the most exciting thing to find in a magical garden?",
          communityTitle: "🌸 Enchanted Garden Adventures!",
          emoji: "🌺"
        }
      ],
      tweens: [
        {
          title: "Future Dream Job",
          description: "Draw yourself in your absolute dream job 10 years from now! What would you be doing? Where would you work? Include details about your workspace, tools, or the people around you. Make it as amazing and inspiring as possible! What would make this the perfect job for you?",
          communityTitle: "🚀 Our Future Dream Careers!",
          emoji: "💼"
        },
        {
          title: "Perfect Hangout Spot",
          description: "Design the ultimate hangout space for you and your friends! It could be indoors or outdoors, with games, snacks, music, or whatever makes it perfect for spending time together. Show all the details that would make this the best place ever! What would make you never want to leave?",
          communityTitle: "🎮 Epic Friend Hangout Spaces!",
          emoji: "🏠"
        },
        {
          title: "Adventure to Remember",
          description: "Draw the most incredible adventure you can imagine taking! It could be exploring ancient ruins, swimming with dolphins, climbing amazing mountains, or traveling to a dream destination. Include yourself in the scene having the time of your life! Where would your perfect adventure take you?",
          communityTitle: "🗺️ Ultimate Adventure Dreams!",
          emoji: "⛰️"
        }
      ]
    }

    const prompts = sharedFallbacks[ageGroup]
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]
    
    return {
      ...randomPrompt,
      difficulty: 'medium',
      ageGroup
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
        difficulty: 'easy',
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

  // Generate 2 random fun prompts - not tied to time slots at all
  static async generateMVPCommunityPrompts(ageGroup: 'kids' | 'tweens'): Promise<(GeneratedPrompt & { communityTitle: string })[]> {
    const timeSlots: TimeSlot[] = ['daily_1', 'daily_2']

    try {
      const ageInstruction = ageGroup === 'kids'
        ? 'You are a playful and inspiring assistant that gives two creative daily drawing challenge prompts to kids aged 6–10.'
        : 'You are a creative assistant that gives two engaging daily drawing challenge prompts to tweens aged 11–16.'

      const themeGuidelines = ageGroup === 'kids'
        ? `Each day, generate **two different prompts** that a child might be excited to draw. The prompts can include any of these themes:
- Nature (animals, plants, oceans, seasons)
- Imagination (fantasy, magic, silly inventions, made-up creatures)
- Real Life (family, home, school, meals, pets)
- Emotions (what makes them happy, scared, proud)
- Favorites (favorite toy, food, holiday, person)
- Memories or dreams (funny dream, favorite trip, yesterday's sunset)`
        : `Each day, generate **two different prompts** that a tween might find engaging. The prompts can include themes like:
- Nature and science (animals, space, weather phenomena)
- Creative imagination (inventions, fantasy worlds, character design)
- Real life experiences (friendships, hobbies, future dreams)
- Personal expression (emotions, identity, social situations)
- Interests and favorites (music, sports, technology, art styles)
- Memories and aspirations (childhood memories, future goals, meaningful moments)`

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: `${ageInstruction}

${themeGuidelines}

Guidelines:
- Prompts must be age-appropriate, friendly, and creative
- Use simple, playful language that a ${ageGroup === 'kids' ? '6 to 10 year old' : '11 to 16 year old'} can understand and get excited about
- Do **not** categorize the prompts — just give two unique ones per day
- Avoid anything dark, violent, or scary
- Keep each prompt short and imaginative
- Make sure both prompts feel different from each other
- Create prompts with varying complexity - first one easy, second one medium

Return ONLY a JSON array with 2 prompts, first easy then medium difficulty:
[
  {
    "title": "Title (max 6 words)",
    "description": "Fun description of what to draw",
    "communityTitle": "🌟 Our [Topic] Collection!",
    "emoji": "😊",
    "difficulty": "easy|medium|hard",
    "ageGroup": "${ageGroup}"
  }
]`
          },
          { 
            role: "user", 
            content: "Generate 2 diverse drawing prompts for today. Make sure they're different themes and exciting for kids to draw!"
          }
        ],
        temperature: 1.0,
        max_tokens: 800,
        response_format: { type: "json_object" }
      })

      const response = completion.choices[0].message.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      const promptsData = JSON.parse(response) as { prompts: (GeneratedPrompt & { communityTitle: string })[] } | (GeneratedPrompt & { communityTitle: string })[]
      const prompts = Array.isArray(promptsData) ? promptsData : promptsData.prompts

      if (!prompts || prompts.length !== 2) {
        throw new Error('Invalid prompts format from OpenAI')
      }

      // Add timeSlots for storage, keep AI-generated difficulty
      prompts.forEach((prompt, i) => {
        prompt.timeSlot = timeSlots[i]
        prompt.ageGroup = ageGroup
      })

      return prompts

    } catch (error) {
      console.error(`Failed to generate community prompts for ${ageGroup}:`, error)
      
      // Fallback to individual generation
      const prompts: (GeneratedPrompt & { communityTitle: string })[] = []
      const themes = ['nature', 'imagination']
      
      for (let i = 0; i < 2; i++) {
        try {
          const prompt = await this.generateSharedDailyPrompt({
            ageGroup,
            difficulty: i === 0 ? 'easy' : 'medium',
            previousPrompts: prompts.map(p => p.title),
            theme: themes[i]
          })
          
          prompt.timeSlot = timeSlots[i]
          prompts.push(prompt)
        } catch (fallbackError) {
          const fallbackPrompt = this.getFallbackCommunityPrompt(ageGroup, timeSlots[i], '')
          prompts.push(fallbackPrompt)
        }
      }

      return prompts
    }
  }

  // Fallback community prompts with diverse themes
  static getFallbackCommunityPrompt(
    ageGroup: 'kids' | 'tweens', 
    timeSlot: TimeSlot, 
    theme: string
  ): GeneratedPrompt & { communityTitle: string } {
    const diverseFallbacks = {
      kids: {
        daily_1: [
          {
            title: "Busy Morning Animals",
            description: "Draw animals getting ready for their day! Show a bear brushing teeth, a bird doing stretches, or a rabbit getting dressed. What funny morning routine would your favorite animal have?",
            communityTitle: "🐻 Animals Starting Their Day!",
            emoji: "🐰"
          },
          {
            title: "Morning Exercise Fun",
            description: "Draw yourself or friends doing morning exercises! Maybe jumping jacks in the park, running with your dog, or playing an active game. What's your favorite way to get energized in the morning?",
            communityTitle: "🏃 Our Morning Energy Boost!",
            emoji: "⚽"
          },
          {
            title: "School Bus Adventure", 
            description: "Draw the most exciting school bus ride ever! Maybe the bus can fly, has special powers, or visits amazing places. What would make your school bus ride an incredible adventure?",
            communityTitle: "🚌 Our Amazing School Adventures!",
            emoji: "🎒"
          }
        ],
        daily_2: [
          {
            title: "Community Helper Heroes",
            description: "Draw yourself as a community helper! You could be a firefighter, teacher, doctor, or inventor. Show yourself helping others in your neighborhood. What special job would you love to have?",
            communityTitle: "🚒 Our Community Helper Dreams!",
            emoji: "👩‍🚒"
          },
          {
            title: "Building Something Amazing",
            description: "Draw yourself building or creating something incredible! It could be with blocks, art supplies, or found objects in nature. What amazing creation would you make with your hands?",
            communityTitle: "🔨 Our Creative Constructions!",
            emoji: "🧱"
          },
          {
            title: "Best Friend Adventure",
            description: "Draw you and your best friend (or pet!) having the most fun afternoon ever! What games would you play? Where would you explore? Show your special friendship adventure!",
            communityTitle: "👫 Our Friendship Adventures!",
            emoji: "🤝"
          }
        ],
        free_draw: [
          {
            title: "Family Dinner Stories",
            description: "Draw your family having dinner together and sharing stories! What delicious food are you eating? What funny stories are being told? Show your special family mealtime!",
            communityTitle: "🍽️ Our Family Dinner Time!",
            emoji: "🥘"
          },
          {
            title: "Bedtime Story Characters",
            description: "Draw characters from your favorite bedtime story coming to life in your room! Maybe they're dancing, playing, or helping you get ready for bed. What story characters would visit you?",
            communityTitle: "📚 Our Bedtime Story Friends!",
            emoji: "🧸"
          },
          {
            title: "Counting Stars",
            description: "Draw yourself looking up at a beautiful starry night! What shapes do you see in the stars? Maybe animals, objects, or magical creatures. What amazing things do you discover in the night sky?",
            communityTitle: "⭐ Our Starry Night Discoveries!",
            emoji: "🌙"
          }
        ]
      },
      tweens: {
        daily_1: [
          {
            title: "Personal Morning Ritual",
            description: "Draw your ideal morning routine that gets you excited for the day! Include activities, music, food, or practices that energize and inspire you. What makes your morning perfect?",
            communityTitle: "🌅 Our Personal Morning Vibes!",
            emoji: "☕"
          },
          {
            title: "Learning Something New",
            description: "Draw yourself discovering or learning something fascinating! It could be a new skill, subject, or hobby that excites you. What knowledge or ability would you love to master?",
            communityTitle: "📖 Our Learning Adventures!",
            emoji: "🧠"
          }
        ],
        daily_2: [
          {
            title: "Creative Expression",
            description: "Draw yourself expressing your creativity in your favorite way! Whether it's art, music, writing, dance, or something unique to you. How do you share your inner creativity with the world?",
            communityTitle: "🎨 Our Creative Expressions!",
            emoji: "🎭"
          },
          {
            title: "Adventure in Your Community",
            description: "Draw an adventure taking place right in your neighborhood or town! Discover hidden spots, meet interesting people, or find something unexpected. What exciting discoveries are around you?",
            communityTitle: "🗺️ Our Local Adventures!",
            emoji: "🏘️"
          }
        ],
        free_draw: [
          {
            title: "Reflection and Growth",
            description: "Draw a peaceful scene that represents your personal growth or a meaningful moment of reflection. Show yourself processing the day, setting goals, or appreciating progress you've made.",
            communityTitle: "🌱 Our Growth Moments!",
            emoji: "💭"
          },
          {
            title: "Dream Planning",
            description: "Draw yourself planning or visualizing a future goal or dream! Include vision boards, sketches, or scenes of what you're working toward. What are you excited to achieve?",
            communityTitle: "✨ Our Future Plans!",
            emoji: "🎯"
          }
        ]
      }
    }

    // Pick a random fallback from the available options
    const timeSlotFallbacks = diverseFallbacks[ageGroup][timeSlot]
    const randomFallback = timeSlotFallbacks[Math.floor(Math.random() * timeSlotFallbacks.length)]
    
    return {
      ...randomFallback,
      difficulty: 'medium' as const,
      ageGroup,
      timeSlot
    }
  }
}