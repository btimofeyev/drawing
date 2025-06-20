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
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setIsLoading(true)
      
      // TODO: Replace with actual API calls to fetch real profile data
      const [profileRes, statsRes, achievementsRes, artworkRes] = await Promise.all([
        fetch('/api/child/profile'),
        fetch('/api/child/stats'), 
        fetch('/api/child/achievements'),
        fetch('/api/child/artworks')
      ])
      
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData.profile)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats)
      } else {
        // Set default empty stats if API call fails
        setStats({
          totalPosts: 0,
          totalLikes: 0,
          totalViews: 0,
          likesGiven: 0,
          currentStreak: 0,
          bestStreak: 0,
          challengesCompleted: 0,
          favoriteTag: ''
        })
      }

      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json()
        setAchievements(achievementsData.achievements || [])
      } else {
        setAchievements([])
      }

      if (artworkRes.ok) {
        const artworkData = await artworkRes.json()
        setRecentArtworks(artworkData.artworks || [])
      } else {
        setRecentArtworks([])
      }
      
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
      // Set default empty stats on error
      setStats({
        totalPosts: 0,
        totalLikes: 0,
        totalViews: 0,
        likesGiven: 0,
        currentStreak: 0,
        bestStreak: 0,
        challengesCompleted: 0,
        favoriteTag: ''
      })
      setAchievements([])
      setRecentArtworks([])
    } finally {
      setIsLoading(false)
    }
  }

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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <p className="text-xl font-semibold text-gray-700">Loading your amazing profile... 🎨</p>
        </div>
      </div>
    )
  }

  if (!profile || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/child-home">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors font-medium">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </button>
                </Link>
                <div className="h-6 w-px bg-gray-300" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center">
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
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              We couldn't load your profile information. Please try again!
            </p>
            <button 
              onClick={fetchProfileData}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-8 rounded-2xl hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/child-home">
                <button className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors font-medium">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center">
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
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-pink-100 mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {profile.name[0].toUpperCase()}
                </span>
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h2 className="text-3xl font-bold text-gray-900">{profile.name}</h2>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold">
                    <Crown className="h-4 w-4 inline mr-1" />
                    Level {profile.level}
                  </span>
                  <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full font-bold">
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
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-pink-100">
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
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
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
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-pink-100 animate-fade-in">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center">
                    <Palette className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Artworks</h3>
                    <p className="text-2xl font-bold text-pink-600">{stats.totalPosts}</p>
                  </div>
                </div>
                <p className="text-gray-600">Keep creating amazing art!</p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-lg border border-red-100 animate-fade-in">
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

              <div className="bg-white rounded-3xl p-6 shadow-lg border border-blue-100 animate-fade-in">
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

              <div className="bg-white rounded-3xl p-6 shadow-lg border border-yellow-100 animate-fade-in">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Current Streak</h3>
                    <p className="text-2xl font-bold text-yellow-600">{stats.currentStreak} days</p>
                  </div>
                </div>
                <p className="text-gray-600">Keep the momentum going!</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-purple-100 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-pink-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-purple-400" />
                </div>
                <p className="text-gray-600 font-medium">No recent activity</p>
                <p className="text-sm text-gray-500 mt-2">Start creating to see your activity here!</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-pink-100 to-purple-100 flex items-center justify-center mx-auto mb-6">
              <Trophy className="h-10 w-10 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Achievements Yet</h3>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Start creating artwork and completing challenges to unlock amazing achievements!
            </p>
            <Link href="/child-home">
              <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-8 rounded-2xl hover:scale-105 transition-all duration-200 shadow-lg">
                Start Creating
              </button>
            </Link>
          </div>
        )}

        {activeTab === 'artworks' && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-pink-100 to-purple-100 flex items-center justify-center mx-auto mb-6">
              <Palette className="h-10 w-10 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Artwork Yet</h3>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Create your first masterpiece and watch your gallery come to life!
            </p>
            <Link href="/create">
              <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 px-8 rounded-2xl hover:scale-105 transition-all duration-200 shadow-lg">
                <span className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Create Your First Artwork
                  <span>🎨</span>
                </span>
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}