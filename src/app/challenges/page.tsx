'use client'

import { useState, useEffect } from 'react'
import { 
  Target, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Star,
  Search,
  Filter,
  Camera,
  Sparkles,
  Trophy,
  Heart,
  Users,
  Palette,
  Zap,
  Crown,
  Gift,
  CheckCircle,
  Play
} from 'lucide-react'
import Link from 'next/link'

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  emoji: string
  category: 'animals' | 'fantasy' | 'nature' | 'people' | 'objects' | 'places'
  date: string
  isToday: boolean
  isCompleted: boolean
  completionCount: number
  timeEstimate: string
  tags: string[]
  points: number
}

interface Child {
  id: string
  username: string
  name: string
  level: number
  totalPoints: number
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [child, setChild] = useState<Child | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'today' | 'all' | 'completed'>('today')

  useEffect(() => {
    fetchChallengesData()
  }, [])

  const fetchChallengesData = async () => {
    try {
      setIsLoading(true)
      
      // Mock data - in real app this would come from API
      const mockChallenges: Challenge[] = [
        {
          id: '1',
          title: 'Draw Your Dream Pet',
          description: 'Imagine the perfect pet and bring it to life! It could be real or fantastical.',
          difficulty: 'easy',
          emoji: '🐱',
          category: 'animals',
          date: new Date().toISOString().split('T')[0],
          isToday: true,
          isCompleted: false,
          completionCount: 156,
          timeEstimate: '20-30 min',
          tags: ['pets', 'imagination', 'cute'],
          points: 50
        },
        {
          id: '2',
          title: 'Magical Forest Creature',
          description: 'Create a mystical being that lives deep in an enchanted forest.',
          difficulty: 'medium',
          emoji: '🧚',
          category: 'fantasy',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          isToday: false,
          isCompleted: true,
          completionCount: 89,
          timeEstimate: '30-45 min',
          tags: ['magic', 'creatures', 'forest'],
          points: 75
        },
        {
          id: '3',
          title: 'Superhero Self-Portrait',
          description: 'Draw yourself as a superhero! What would your powers be?',
          difficulty: 'medium',
          emoji: '🦸',
          category: 'people',
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          isToday: false,
          isCompleted: false,
          completionCount: 203,
          timeEstimate: '25-40 min',
          tags: ['heroes', 'self', 'powers'],
          points: 75
        },
        {
          id: '4',
          title: 'Underwater Adventure',
          description: 'Dive deep into the ocean and discover amazing sea creatures!',
          difficulty: 'hard',
          emoji: '🐠',
          category: 'nature',
          date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
          isToday: false,
          isCompleted: false,
          completionCount: 67,
          timeEstimate: '45-60 min',
          tags: ['ocean', 'fish', 'adventure'],
          points: 100
        },
        {
          id: '5',
          title: 'Robot Friend',
          description: 'Design a friendly robot that could be your companion!',
          difficulty: 'easy',
          emoji: '🤖',
          category: 'objects',
          date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
          isToday: false,
          isCompleted: true,
          completionCount: 145,
          timeEstimate: '15-25 min',
          tags: ['robots', 'technology', 'friendship'],
          points: 50
        },
        {
          id: '6',
          title: 'Castle in the Clouds',
          description: 'Draw a magnificent castle floating high up in the sky!',
          difficulty: 'hard',
          emoji: '🏰',
          category: 'places',
          date: new Date(Date.now() - 432000000).toISOString().split('T')[0],
          isToday: false,
          isCompleted: false,
          completionCount: 34,
          timeEstimate: '50-70 min',
          tags: ['castle', 'clouds', 'fantasy'],
          points: 100
        }
      ]

      setChallenges(mockChallenges)
      setChild({
        id: '1',
        username: 'coolartist123',
        name: 'Alex',
        level: 5,
        totalPoints: 342
      })
    } catch (error) {
      console.error('Failed to load challenges:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-700 border-red-200'
    }
  }

  const getCategoryIcon = (category: Challenge['category']) => {
    switch (category) {
      case 'animals': return '🐾'
      case 'fantasy': return '✨'
      case 'nature': return '🌿'
      case 'people': return '👥'
      case 'objects': return '🎯'
      case 'places': return '🗺️'
    }
  }

  const filteredChallenges = challenges.filter(challenge => {
    const matchesCategory = selectedCategory === 'all' || challenge.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || challenge.difficulty === selectedDifficulty
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesView = viewMode === 'all' || 
      (viewMode === 'today' && challenge.isToday) ||
      (viewMode === 'completed' && challenge.isCompleted)
    
    return matchesCategory && matchesDifficulty && matchesSearch && matchesView
  })

  const todaysChallenge = challenges.find(c => c.isToday)
  const completedCount = challenges.filter(c => c.isCompleted).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 float"
               style={{background: 'var(--gradient-rainbow)'}}>
            <Target className="h-8 w-8 text-white" />
          </div>
          <p className="text-xl font-semibold text-gray-700">Loading challenges...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-primary-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/child-home">
                <button className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors font-medium">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{background: 'var(--gradient-accent)'}}>
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Drawing Challenges</h1>
                  <p className="text-sm text-accent-600">Find your next creative adventure!</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 px-4 py-2 bg-accent-100 rounded-full">
                <Star className="h-5 w-5 text-accent-600" />
                <span className="font-bold text-accent-700">{child?.totalPoints || 0} points</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-blue-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">{todaysChallenge ? 1 : 0}</div>
            <div className="text-sm text-gray-600">Today's Challenge</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-green-500">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">{completedCount}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-purple-500">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-1">{challenges.length}</div>
            <div className="text-sm text-gray-600">Total Challenges</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-orange-500">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-orange-600 mb-1">{challenges.filter(c => c.isCompleted).reduce((sum, c) => sum + c.points, 0)}</div>
            <div className="text-sm text-gray-600">Points Earned</div>
          </div>
        </div>

        {/* Today's Featured Challenge */}
        {todaysChallenge && viewMode !== 'completed' && (
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 mb-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/20">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Today's Featured Challenge</h2>
                <p className="text-blue-100">Fresh creative adventure awaits!</p>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl">{todaysChallenge.emoji}</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{todaysChallenge.title}</h3>
                  <p className="text-blue-100 mb-3">{todaysChallenge.description}</p>
                  
                  <div className="flex flex-wrap gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(todaysChallenge.difficulty)}`}>
                      {todaysChallenge.difficulty} level
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/20 text-white">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {todaysChallenge.timeEstimate}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/20 text-white">
                      <Star className="h-4 w-4 inline mr-1" />
                      {todaysChallenge.points} points
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/create" className="flex-1">
                  <button className="w-full bg-white text-blue-600 font-bold py-3 px-6 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                    <Play className="h-5 w-5" />
                    Start Challenge
                  </button>
                </Link>
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors font-medium">
                  <Users className="h-5 w-5" />
                  {todaysChallenge.completionCount} completed
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-primary-100">
            <div className="flex gap-2">
              {[
                { key: 'today', label: 'Today', icon: Calendar },
                { key: 'all', label: 'All Challenges', icon: Target },
                { key: 'completed', label: 'Completed', icon: CheckCircle }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setViewMode(key as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    viewMode === key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-primary-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search challenges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'animals', 'fantasy', 'nature', 'people', 'objects', 'places'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category !== 'all' && <span>{getCategoryIcon(category as Challenge['category'])}</span>}
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Difficulty Filter */}
            <div className="flex gap-2">
              {['all', 'easy', 'medium', 'hard'].map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedDifficulty === difficulty
                      ? 'bg-secondary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge, index) => (
            <div
              key={challenge.id}
              className={`bg-white rounded-2xl shadow-lg border transition-all duration-300 hover:scale-105 hover:shadow-xl bounce-in ${
                challenge.isToday ? 'border-blue-300 ring-2 ring-blue-100' : 
                challenge.isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-200'
              }`}
              style={{animationDelay: `${index * 0.05}s`}}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{challenge.emoji}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{challenge.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">{getCategoryIcon(challenge.category)} {challenge.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  {challenge.isCompleted && (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  {challenge.isToday && !challenge.isCompleted && (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Description */}
                <p className="text-gray-600 mb-4 leading-relaxed">{challenge.description}</p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {challenge.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{challenge.timeEstimate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>{challenge.points} pts</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{challenge.completionCount}</span>
                  </div>
                </div>
                
                {/* Action Button */}
                <Link href="/create">
                  <button 
                    className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-200 ${
                      challenge.isCompleted
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : challenge.isToday
                        ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={challenge.isCompleted}
                  >
                    {challenge.isCompleted ? 'Completed!' : challenge.isToday ? 'Start Today\'s Challenge' : 'Try This Challenge'}
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gray-100">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No challenges found</h3>
            <p className="text-gray-600">Try adjusting your search or filters.</p>
          </div>
        )}
      </main>
    </div>
  )
}