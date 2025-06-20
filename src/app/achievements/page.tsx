'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Trophy, 
  Crown, 
  Star,
  Search,
  Target,
  Heart,
  Palette,
  Clock,
  Sparkles,
  Flame
} from 'lucide-react'
import ChildLayout from '@/components/ChildLayout'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'creation' | 'social' | 'streak' | 'skill' | 'special'
  earned: boolean
  earnedDate?: string
  progress?: number
  total?: number
  points: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  hint?: string
}

interface Child {
  id: string
  username: string
  name: string
  level: number
  totalPoints: number
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Enhanced achievement definitions with metadata
  const getDefaultAchievements = (): Achievement[] => [
    // ===== CREATION ACHIEVEMENTS =====
    {
      id: 'create_1',
      name: 'First Steps',
      description: 'Upload your very first artwork!',
      icon: '🎨',
      category: 'creation',
      earned: false,
      points: 50,
      rarity: 'common',
      hint: 'Complete any daily challenge to earn this!'
    },
    {
      id: 'create_2',
      name: 'Creative Explorer',
      description: 'Upload 5 amazing artworks',
      icon: '🖌️',
      category: 'creation',
      earned: false,
      points: 150,
      rarity: 'common'
    },
    {
      id: 'create_3',
      name: 'Prolific Artist',
      description: 'Upload 10 incredible pieces',
      icon: '🎭',
      category: 'creation',
      earned: false,
      points: 300,
      rarity: 'common'
    },
    {
      id: 'create_4',
      name: 'Art Master',
      description: 'Upload 25 incredible artworks',
      icon: '🏆',
      category: 'creation',
      earned: false,
      points: 750,
      rarity: 'rare'
    },
    {
      id: 'create_5',
      name: 'Gallery Curator',
      description: 'Upload 50 masterpieces',
      icon: '🖼️',
      category: 'creation',
      earned: false,
      points: 1500,
      rarity: 'epic'
    },
    {
      id: 'create_6',
      name: 'Gallery Legend',
      description: 'Upload 100 legendary artworks',
      icon: '👑',
      category: 'creation',
      earned: false,
      points: 3000,
      rarity: 'legendary'
    },

    // ===== SOCIAL ACHIEVEMENTS =====
    {
      id: 'social_1',
      name: 'Supporter',
      description: 'Give your first like to another artist',
      icon: '❤️',
      category: 'social',
      earned: false,
      points: 25,
      rarity: 'common'
    },
    {
      id: 'social_2',
      name: 'Community Spirit',
      description: 'Give 25 likes to support other artists',
      icon: '🤝',
      category: 'social',
      earned: false,
      points: 200,
      rarity: 'common'
    },
    {
      id: 'social_3',
      name: 'Art Encourager',
      description: 'Give 100 likes to fellow artists',
      icon: '👏',
      category: 'social',
      earned: false,
      points: 500,
      rarity: 'rare'
    },
    {
      id: 'social_4',
      name: 'First Fan',
      description: 'Receive your first like!',
      icon: '⭐',
      category: 'social',
      earned: false,
      points: 50,
      rarity: 'common'
    },
    {
      id: 'social_5',
      name: 'Rising Star',
      description: 'Receive 10 likes on your artwork',
      icon: '🌟',
      category: 'social',
      earned: false,
      points: 150,
      rarity: 'common'
    },
    {
      id: 'social_6',
      name: 'Art Lover',
      description: 'Receive 50 likes on your artwork',
      icon: '💖',
      category: 'social',
      earned: false,
      points: 400,
      rarity: 'rare'
    },
    {
      id: 'social_7',
      name: 'Popular Artist',
      description: 'Receive 200 likes across all artwork',
      icon: '🔥',
      category: 'social',
      earned: false,
      points: 800,
      rarity: 'epic'
    },
    {
      id: 'social_8',
      name: 'Inspiration Machine',
      description: 'Receive 500 likes across all your artwork',
      icon: '✨',
      category: 'social',
      earned: false,
      points: 2000,
      rarity: 'legendary'
    },

    // ===== STREAK ACHIEVEMENTS =====
    {
      id: 'streak_1',
      name: 'Daily Artist',
      description: 'Create art for 3 days in a row',
      icon: '🔥',
      category: 'streak',
      earned: false,
      points: 100,
      rarity: 'common'
    },
    {
      id: 'streak_2',
      name: 'Week Warrior',
      description: 'Create art for 7 days straight',
      icon: '⚡',
      category: 'streak',
      earned: false,
      points: 300,
      rarity: 'rare'
    },
    {
      id: 'streak_3',
      name: 'Two Week Champion',
      description: 'Create art for 14 days in a row',
      icon: '💪',
      category: 'streak',
      earned: false,
      points: 600,
      rarity: 'epic'
    },
    {
      id: 'streak_4',
      name: 'Unstoppable Creator',
      description: 'Create art for 30 days in a row',
      icon: '🚀',
      category: 'streak',
      earned: false,
      points: 1500,
      rarity: 'legendary'
    },

    // ===== SKILL ACHIEVEMENTS =====
    {
      id: 'skill_1',
      name: 'Morning Person',
      description: 'Complete 5 morning challenges',
      icon: '🌅',
      category: 'skill',
      earned: false,
      points: 150,
      rarity: 'common'
    },
    {
      id: 'skill_2',
      name: 'Afternoon Artist',
      description: 'Complete 5 afternoon challenges',
      icon: '☀️',
      category: 'skill',
      earned: false,
      points: 150,
      rarity: 'common'
    },
    {
      id: 'skill_3',
      name: 'Night Owl',
      description: 'Complete 5 evening challenges',
      icon: '🌙',
      category: 'skill',
      earned: false,
      points: 150,
      rarity: 'common'
    },
    {
      id: 'skill_4',
      name: 'Triple Threat',
      description: 'Complete all 3 challenges in a single day',
      icon: '🎯',
      category: 'skill',
      earned: false,
      points: 500,
      rarity: 'epic'
    },

    // ===== SPECIAL ACHIEVEMENTS =====
    {
      id: 'special_1',
      name: 'Welcome Aboard!',
      description: 'Join the Daily Scribble community',
      icon: '🎉',
      category: 'special',
      earned: false,
      points: 100,
      rarity: 'common'
    },
    {
      id: 'special_2',
      name: 'First View',
      description: 'Have someone view your artwork',
      icon: '👁️',
      category: 'special',
      earned: false,
      points: 50,
      rarity: 'common'
    },
    {
      id: 'special_3',
      name: 'Trending Artist',
      description: 'Have your art viewed 100 times',
      icon: '📈',
      category: 'special',
      earned: false,
      points: 300,
      rarity: 'rare'
    },
    {
      id: 'special_4',
      name: 'Gallery Superstar',
      description: 'Have your art viewed 1000 times',
      icon: '⭐',
      category: 'special',
      earned: false,
      points: 2000,
      rarity: 'legendary'
    }
  ]

  // Function to enhance API achievements with frontend metadata
  const enhanceAchievementsWithMetadata = (apiAchievements: any[]): Achievement[] => {
    const defaultAchievements = getDefaultAchievements()
    
    return apiAchievements.map(apiAchievement => {
      // Find matching default achievement for metadata
      const defaultMatch = defaultAchievements.find(def => 
        def.name === apiAchievement.name || 
        def.id === apiAchievement.id
      )
      
      return {
        id: apiAchievement.id,
        name: apiAchievement.name,
        description: apiAchievement.description || defaultMatch?.description || 'Achievement description',
        icon: defaultMatch?.icon || '🏆',
        category: defaultMatch?.category || 'special',
        earned: apiAchievement.earned || false,
        earnedDate: apiAchievement.earnedAt || apiAchievement.earnedDate,
        progress: apiAchievement.progress || 0,
        total: apiAchievement.total || 1,
        points: apiAchievement.points || defaultMatch?.points || 100,
        rarity: defaultMatch?.rarity || 'common',
        hint: defaultMatch?.hint
      }
    })
  }

  const fetchAchievementsData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch real data from APIs
      const [achievementsRes, statsRes] = await Promise.all([
        fetch('/api/child/achievements'),
        fetch('/api/child/stats')
      ])

      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json()
        // Transform API data to include required fields for frontend
        const enhancedAchievements = enhanceAchievementsWithMetadata(achievementsData.achievements || [])
        setAchievements(enhancedAchievements)
      } else {
        // Fallback to comprehensive achievement definitions if API fails
        setAchievements(getDefaultAchievements())
      }

      // We don't need to store child data separately anymore
    } catch (error) {
      console.error('Failed to load achievements:', error)
      // Use default achievements on error
      setAchievements(getDefaultAchievements())
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAchievementsData()
  }, [])

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'creation': return <Palette className="h-4 w-4" />
      case 'social': return <Heart className="h-4 w-4" />
      case 'streak': return <Flame className="h-4 w-4" />
      case 'skill': return <Target className="h-4 w-4" />
      case 'special': return <Crown className="h-4 w-4" />
    }
  }

  const getProgressPercentage = (current: number, total: number) => {
    return Math.min((current / total) * 100, 100)
  }

  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory
    const matchesSearch = achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  const earnedCount = achievements.filter(a => a.earned).length
  const totalPoints = achievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0)

  if (isLoading) {
    return (
      <ChildLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center mx-auto mb-6">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <p className="text-xl font-semibold text-slate-700">Loading your achievements...</p>
          </div>
        </div>
      </ChildLayout>
    )
  }

  return (
    <ChildLayout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Simple Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 text-slate-800">
              Your <span className="text-pink-400">Achievements</span>
            </h1>
            <p className="text-xl text-slate-600 text-center">
              Celebrate your creative journey and unlock new badges as you create amazing art!
            </p>
          </div>

          {/* Simple Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-slate-800">{earnedCount}</div>
              <div className="text-slate-600">Achievements</div>
            </div>
            
            <div className="bg-white rounded-3xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-slate-800">{totalPoints}</div>
              <div className="text-slate-600">Points Earned</div>
            </div>
            
            <div className="bg-white rounded-3xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-slate-800">{achievements.length - earnedCount}</div>
              <div className="text-slate-600">To Unlock</div>
            </div>
          </div>

          {/* Simple Filters */}
          <div className="bg-white rounded-3xl p-6 shadow-lg mb-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search achievements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-400"
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'all', label: 'All', icon: <Sparkles className="h-4 w-4" /> },
                  { key: 'creation', label: 'Creation', icon: <Palette className="h-4 w-4" /> },
                  { key: 'social', label: 'Social', icon: <Heart className="h-4 w-4" /> },
                  { key: 'streak', label: 'Streaks', icon: <Flame className="h-4 w-4" /> },
                  { key: 'skill', label: 'Skills', icon: <Target className="h-4 w-4" /> },
                  { key: 'special', label: 'Special', icon: <Crown className="h-4 w-4" /> }
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-medium transition-all ${
                      selectedCategory === key
                        ? 'bg-pink-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Clean Achievement Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement, index) => (
              <div
                key={achievement.id}
                className={`bg-white rounded-3xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl animate-fade-in ${
                  achievement.earned ? 'border-green-200' : 'border-slate-200'
                }`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Icon and Title */}
                <div className="text-center mb-4">
                  <div className={`text-5xl mb-3 ${achievement.earned ? '' : 'grayscale opacity-60'}`}>
                    {achievement.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-slate-800">
                    {achievement.name}
                  </h3>
                  <p className="text-slate-600 text-sm mb-3">
                    {achievement.description}
                  </p>
                </div>

                {/* Points */}
                <div className="flex items-center justify-center gap-1 mb-4">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold text-yellow-600">{achievement.points} points</span>
                </div>

                {/* Status */}
                {achievement.earned ? (
                  <div className="bg-green-100 text-green-700 font-bold text-sm py-3 px-4 rounded-2xl text-center">
                    <Trophy className="h-4 w-4 inline mr-1" />
                    Unlocked!
                  </div>
                ) : achievement.progress && achievement.total ? (
                  <div className="space-y-2">
                    <div className="bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getProgressPercentage(achievement.progress, achievement.total)}%` }}
                      />
                    </div>
                    <p className="text-sm text-center text-slate-600">
                      {achievement.progress}/{achievement.total} completed
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-100 text-slate-500 font-medium text-sm py-3 px-4 rounded-2xl text-center">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Locked
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredAchievements.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">No achievements found</h3>
              <p className="text-slate-600 mb-8">Try a different search or category</p>
              <button 
                onClick={() => {
                  setSelectedCategory('all')
                  setSearchQuery('')
                }}
                className="bg-pink-500 text-white font-bold py-3 px-8 rounded-2xl hover:bg-pink-600 transition-colors"
              >
                Show All Achievements
              </button>
            </div>
          )}
        </div>
      </div>
    </ChildLayout>
  )
}