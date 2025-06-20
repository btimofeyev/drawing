'use client'

import { useState, useEffect } from 'react'
import { 
  Trophy, 
  Crown, 
  Star,
  Filter,
  Search,
  Gift,
  Target,
  Heart,
  Palette,
  TrendingUp,
  Users,
  Zap,
  Clock
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
  const [child, setChild] = useState<Child | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'earned' | 'progress'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAchievementsData()
  }, [])

  const fetchAchievementsData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch achievements and child data in parallel
      const [achievementsRes, statsRes] = await Promise.all([
        fetch('/api/child/achievements'),
        fetch('/api/child/stats')
      ])

      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json()
        setAchievements(achievementsData.achievements)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setChild(statsData.child)
      }
    } catch (error) {
      console.error('Failed to load achievements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-slate-300 bg-slate-50'
      case 'rare': return 'border-blue-300 bg-blue-50'
      case 'epic': return 'border-purple-300 bg-purple-50'
      case 'legendary': return 'border-yellow-300 bg-yellow-50'
    }
  }

  const getRarityText = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-slate-700'
      case 'rare': return 'text-blue-700'
      case 'epic': return 'text-purple-700'
      case 'legendary': return 'text-yellow-700'
    }
  }

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'creation': return <Palette className="h-4 w-4" />
      case 'social': return <Heart className="h-4 w-4" />
      case 'streak': return <TrendingUp className="h-4 w-4" />
      case 'skill': return <Target className="h-4 w-4" />
      case 'special': return <Crown className="h-4 w-4" />
    }
  }

  const getProgressPercentage = (current: number, total: number) => {
    return Math.min((current / total) * 100, 100)
  }

  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'earned' && achievement.earned) ||
      (selectedFilter === 'progress' && !achievement.earned && achievement.progress)
    const matchesSearch = achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesFilter && matchesSearch
  })

  const earnedCount = achievements.filter(a => a.earned).length
  const totalPoints = achievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0)

  if (isLoading) {
    return (
      <ChildLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="icon-container pink mx-auto mb-6" style={{width: '4rem', height: '4rem'}}>
              <Trophy style={{width: '2rem', height: '2rem'}} />
            </div>
            <p className="text-xl font-semibold text-slate-700">Loading your achievements...</p>
          </div>
        </div>
      </ChildLayout>
    )
  }

  return (
    <ChildLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-slate-800 leading-tight">
              My <span className="text-pink-400">Achievements</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Collect badges as you create amazing artwork!
            </p>
          </div>
          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 text-center">
              <div className="icon-container pink mx-auto mb-3">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-1">{earnedCount}</div>
              <div className="text-sm text-slate-600">Achievements Earned</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 text-center">
              <div className="icon-container pink mx-auto mb-3">
                <Star className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-1">{totalPoints}</div>
              <div className="text-sm text-slate-600">Points from Badges</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 text-center">
              <div className="icon-container pink mx-auto mb-3">
                <Crown className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-1">Level {child?.level || 1}</div>
              <div className="text-sm text-slate-600">Current Level</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 text-center">
              <div className="icon-container pink mx-auto mb-3">
                <Target className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-1">{achievements.length - earnedCount}</div>
              <div className="text-sm text-slate-600">To Unlock</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search achievements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {['all', 'creation', 'social', 'streak', 'skill', 'special'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      selectedCategory === category
                        ? 'btn btn-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {category !== 'all' && getCategoryIcon(category as Achievement['category'])}
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
              
              {/* Status Filter */}
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'earned', label: 'Earned' },
                  { key: 'progress', label: 'In Progress' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedFilter(key as any)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      selectedFilter === key
                        ? 'btn btn-secondary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAchievements.map((achievement, index) => (
            <div
              key={achievement.id}
              className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 hover:scale-105 animate-fade-in ${
                getRarityColor(achievement.rarity)
              } ${achievement.earned ? 'hover:shadow-2xl' : 'opacity-75'}`}
              style={{animationDelay: `${index * 0.05}s`}}
            >
              <div className="text-center">
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {getCategoryIcon(achievement.category)}
                    <span className="capitalize">{achievement.category}</span>
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                    achievement.rarity === 'common' ? 'bg-slate-200 text-slate-700' :
                    achievement.rarity === 'rare' ? 'bg-blue-200 text-blue-700' :
                    achievement.rarity === 'epic' ? 'bg-purple-200 text-purple-700' :
                    'bg-yellow-200 text-yellow-700'
                  }`}>
                    {achievement.rarity.toUpperCase()}
                  </div>
                </div>
                
                {/* Icon */}
                <div className={`text-4xl mb-3 ${achievement.earned ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                
                {/* Name and Description */}
                <h3 className={`font-bold text-lg mb-2 ${getRarityText(achievement.rarity)}`}>
                  {achievement.name}
                </h3>
                
                <p className="text-slate-600 text-sm mb-3">
                  {achievement.description}
                </p>
                
                {/* Points */}
                <div className="flex items-center justify-center gap-1 mb-4 text-pink-600">
                  <Star className="h-4 w-4" />
                  <span className="font-bold">{achievement.points} points</span>
                </div>
                
                {/* Status */}
                {achievement.earned ? (
                  <div className="text-green-600 font-bold text-sm">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Trophy className="h-4 w-4" />
                      <span>Earned!</span>
                    </div>
                    {achievement.earnedDate && (
                      <div className="text-xs text-slate-500">
                        {new Date(achievement.earnedDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ) : achievement.progress && achievement.total ? (
                  <div className="space-y-2">
                    <div className="bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getProgressPercentage(achievement.progress, achievement.total)}%` }}
                      />
                    </div>
                    <p className="text-sm font-medium text-slate-600">
                      {achievement.progress}/{achievement.total}
                    </p>
                  </div>
                ) : (
                  <div className="text-slate-500 font-medium text-sm">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Locked</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12">
              <div className="icon-container pink mx-auto mb-6" style={{width: '4rem', height: '4rem'}}>
                <Search style={{width: '2rem', height: '2rem'}} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No achievements found</h3>
              <p className="text-slate-600">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </ChildLayout>
  )
}