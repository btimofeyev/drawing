'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Star, 
  Trophy, 
  Heart, 
  Calendar, 
  TrendingUp, 
  Award, 
  Edit3, 
  Camera,
  ArrowLeft,
  Palette,
  Target,
  Zap,
  Crown,
  Gift,
  Settings,
  Eye
} from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  username: string
  name: string
  bio?: string
  ageGroup: 'kids' | 'tweens'
  avatarUrl?: string
  level: number
  totalPoints: number
  joinDate: string
}

interface UserStats {
  totalPosts: number
  totalLikes: number
  totalViews: number
  likesGiven: number
  currentStreak: number
  bestStreak: number
  challengesCompleted: number
  favoriteTag: string
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'creation' | 'social' | 'streak' | 'skill'
  earned: boolean
  earnedDate?: string
  progress?: number
  total?: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface RecentArtwork {
  id: string
  title: string
  thumbnailUrl: string
  likes: number
  views: number
  createdAt: string
  challenge?: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [recentArtworks, setRecentArtworks] = useState<RecentArtwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'artworks'>('overview')

  useEffect(() => {
    // Mock data - in real app this would come from API
    setProfile({
      id: '1',
      username: 'coolartist123',
      name: 'Alex',
      bio: 'I love drawing magical creatures and colorful worlds! 🎨✨',
      ageGroup: 'kids',
      level: 5,
      totalPoints: 342,
      joinDate: '2024-09-15'
    })

    setStats({
      totalPosts: 12,
      totalLikes: 89,
      totalViews: 267,
      likesGiven: 45,
      currentStreak: 5,
      bestStreak: 8,
      challengesCompleted: 9,
      favoriteTag: 'fantasy'
    })

    setAchievements([
      { 
        id: '1', 
        name: 'First Drawing', 
        icon: '🎨', 
        description: 'Upload your first artwork', 
        category: 'creation',
        earned: true, 
        earnedDate: '2024-09-16',
        rarity: 'common'
      },
      { 
        id: '2', 
        name: 'Social Butterfly', 
        icon: '👍', 
        description: 'Give 50 likes to other artists', 
        category: 'social',
        earned: false, 
        progress: 45, 
        total: 50,
        rarity: 'common'
      },
      { 
        id: '3', 
        name: 'Popular Artist', 
        icon: '⭐', 
        description: 'Get 100 likes on your artwork', 
        category: 'social',
        earned: false, 
        progress: 89, 
        total: 100,
        rarity: 'rare'
      },
      { 
        id: '4', 
        name: 'Weekly Creator', 
        icon: '🔥', 
        description: 'Post artwork for 7 days in a row', 
        category: 'streak',
        earned: false, 
        progress: 5, 
        total: 7,
        rarity: 'rare'
      },
      { 
        id: '5', 
        name: 'Fantasy Master', 
        icon: '🐉', 
        description: 'Complete 5 fantasy challenges', 
        category: 'skill',
        earned: true, 
        earnedDate: '2024-12-20',
        rarity: 'epic'
      },
      { 
        id: '6', 
        name: 'Art Legend', 
        icon: '👑', 
        description: 'Reach level 10', 
        category: 'creation',
        earned: false, 
        progress: 5, 
        total: 10,
        rarity: 'legendary'
      }
    ])

    setRecentArtworks([
      {
        id: '1',
        title: 'Magical Rainbow Dragon',
        thumbnailUrl: '/api/placeholder/200/150',
        likes: 15,
        views: 43,
        createdAt: '2025-01-15',
        challenge: 'Fantasy Creatures'
      },
      {
        id: '2',
        title: 'My Dream Pet',
        thumbnailUrl: '/api/placeholder/200/150',
        likes: 23,
        views: 67,
        createdAt: '2025-01-12',
        challenge: 'Dream Pets'
      },
      {
        id: '3',
        title: 'Colorful Castle',
        thumbnailUrl: '/api/placeholder/200/150',
        likes: 18,
        views: 52,
        createdAt: '2025-01-08'
      }
    ])

    setIsLoading(false)
  }, [])

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50'
      case 'rare': return 'border-blue-300 bg-blue-50'
      case 'epic': return 'border-purple-300 bg-purple-50'
      case 'legendary': return 'border-yellow-300 bg-yellow-50'
    }
  }

  const getRarityText = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-700'
      case 'rare': return 'text-blue-700'
      case 'epic': return 'text-purple-700'
      case 'legendary': return 'text-yellow-700'
    }
  }

  const getProgressPercentage = (current: number, total: number) => {
    return Math.min((current / total) * 100, 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 float"
               style={{background: 'var(--gradient-rainbow)'}}>
            <User className="h-8 w-8 text-white" />
          </div>
          <p className="text-xl font-semibold text-gray-700">Loading your amazing profile... 🎨</p>
        </div>
      </div>
    )
  }

  if (!profile || !stats) return null

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
                     style={{background: 'var(--gradient-purple)'}}>
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                  <p className="text-sm text-purple-600">Your creative journey</p>
                </div>
              </div>
            </div>
            
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-medium">
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-primary-100 mb-8 fade-in">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl flex items-center justify-center float"
                   style={{background: 'var(--gradient-primary)'}}>
                <span className="text-4xl font-bold text-white">
                  {profile.name[0].toUpperCase()}
                </span>
              </div>
              <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-secondary-500 text-white rounded-full flex items-center justify-center hover:bg-secondary-600 transition-colors shadow-lg">
                <Camera className="h-5 w-5" />
              </button>
            </div>
            
            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h2 className="text-3xl font-bold text-gray-900">{profile.name}</h2>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 rounded-full text-white font-bold"
                        style={{background: 'var(--gradient-purple)'}}>
                    <Crown className="h-4 w-4 inline mr-1" />
                    Level {profile.level}
                  </span>
                  <span className="px-4 py-2 bg-accent-100 text-accent-700 rounded-full font-bold">
                    <Star className="h-4 w-4 inline mr-1" />
                    {profile.totalPoints} points
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 text-lg mb-4">@{profile.username}</p>
              
              {profile.bio && (
                <p className="text-gray-700 mb-4 text-lg leading-relaxed">{profile.bio}</p>
              )}
              
              <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span className="capitalize">{profile.ageGroup} Artist</span>
                </div>
              </div>
            </div>
            
            {/* Edit Button */}
            <button className="bg-blue-600 text-white font-bold py-3 px-6 rounded-2xl hover:bg-blue-700 hover:scale-105 transition-all duration-200 flex items-center gap-2 shadow-lg">
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-primary-100">
            <div className="flex gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'achievements', label: 'Achievements', icon: Trophy },
                { id: 'artworks', label: 'My Art', icon: Palette }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === id
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

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Stats Cards */}
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-primary-100 bounce-in">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                       style={{background: 'var(--gradient-primary)'}}>
                    <Palette className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Artworks</h3>
                    <p className="text-2xl font-bold text-primary-600">{stats.totalPosts}</p>
                  </div>
                </div>
                <p className="text-gray-600">Keep creating amazing art!</p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-lg border border-red-100 bounce-in" style={{animationDelay: '0.1s'}}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-500">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Total Likes</h3>
                    <p className="text-2xl font-bold text-red-600">{stats.totalLikes}</p>
                  </div>
                </div>
                <p className="text-gray-600">People love your art!</p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-lg border border-blue-100 bounce-in" style={{animationDelay: '0.2s'}}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-500">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Total Views</h3>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalViews}</p>
                  </div>
                </div>
                <p className="text-gray-600">Your art inspires others!</p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-lg border border-accent-100 bounce-in" style={{animationDelay: '0.3s'}}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                       style={{background: 'var(--gradient-accent)'}}>
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Current Streak</h3>
                    <p className="text-2xl font-bold text-accent-600">{stats.currentStreak} days</p>
                  </div>
                </div>
                <p className="text-gray-600">Keep the momentum going!</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-purple-100 slide-in-left">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-2xl">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Earned "Fantasy Master"</p>
                    <p className="text-sm text-gray-600">2 days ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-2xl">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Got 15 likes on "Rainbow Dragon"</p>
                    <p className="text-sm text-gray-600">3 days ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-2xl">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Completed "Dream Pet" challenge</p>
                    <p className="text-sm text-gray-600">5 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <div
                key={achievement.id}
                className={`bg-white rounded-3xl p-6 shadow-lg border-2 transition-all duration-300 hover:scale-105 bounce-in ${
                  getRarityColor(achievement.rarity)
                } ${achievement.earned ? 'hover:shadow-2xl' : 'opacity-75'}`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="text-center">
                  <div className={`text-5xl mb-4 ${achievement.earned ? '' : 'grayscale'}`}>
                    {achievement.icon}
                  </div>
                  
                  <h3 className={`font-bold text-lg mb-2 ${getRarityText(achievement.rarity)}`}>
                    {achievement.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {achievement.description}
                  </p>
                  
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                    achievement.rarity === 'common' ? 'bg-gray-200 text-gray-700' :
                    achievement.rarity === 'rare' ? 'bg-blue-200 text-blue-700' :
                    achievement.rarity === 'epic' ? 'bg-purple-200 text-purple-700' :
                    'bg-yellow-200 text-yellow-700'
                  }`}>
                    {achievement.rarity.toUpperCase()}
                  </div>
                  
                  {achievement.earned ? (
                    <div className="text-green-600 font-bold">
                      ✅ Earned {achievement.earnedDate && new Date(achievement.earnedDate).toLocaleDateString()}
                    </div>
                  ) : achievement.progress && achievement.total ? (
                    <div className="space-y-2">
                      <div className="bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${getProgressPercentage(achievement.progress, achievement.total)}%` }}
                        />
                      </div>
                      <p className="text-sm font-medium text-gray-600">
                        {achievement.progress}/{achievement.total}
                      </p>
                    </div>
                  ) : (
                    <div className="text-gray-500 font-medium">
                      🔒 Locked
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'artworks' && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">My Artwork Gallery</h3>
              <p className="text-gray-600 mb-8">All your amazing creations in one place!</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentArtworks.map((artwork, index) => (
                <div
                  key={artwork.id}
                  className="group bg-white rounded-3xl shadow-lg border border-primary-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden bounce-in"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                    <Palette className="h-16 w-16 text-primary-300" />
                  </div>
                  
                  <div className="p-6">
                    <h4 className="font-bold text-lg text-gray-900 mb-2">{artwork.title}</h4>
                    {artwork.challenge && (
                      <p className="text-purple-600 font-medium text-sm mb-3">🎯 {artwork.challenge}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-red-500">
                          <Heart className="h-4 w-4" />
                          <span className="font-semibold">{artwork.likes}</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-500">
                          <Eye className="h-4 w-4" />
                          <span className="font-semibold">{artwork.views}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(artwork.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <Link href="/create">
                <button className="text-white font-bold py-4 px-8 rounded-2xl hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                        style={{background: 'var(--gradient-primary)'}}>
                  <span className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Create New Artwork
                    <span>🎨</span>
                  </span>
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}