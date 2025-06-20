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
  Eye,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import ChildLayout from '@/components/ChildLayout'

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
  totalLikesReceived: number
  totalLikesGiven: number
  currentStreak: number
  bestStreak: number
  level: number
  points: number
  lastPostDate: string
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
  points: number
  total?: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface Artwork {
  id: string
  imageUrl: string
  thumbnailUrl: string | null
  altText: string
  createdAt: string
  likesCount: number
  timeSlot: 'morning' | 'afternoon' | 'evening'
  moderationStatus: 'pending' | 'approved' | 'rejected'
  challenge?: {
    id: string
    text: string
    difficulty: string
  } | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [artworkToDelete, setArtworkToDelete] = useState<Artwork | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'artworks'>('overview')

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setIsLoading(true)
      
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
          totalLikesReceived: 0,
          totalLikesGiven: 0,
          currentStreak: 0,
          bestStreak: 0,
          level: 1,
          points: 0,
          lastPostDate: ''
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
        setArtworks(artworkData.artworks || [])
      } else {
        setArtworks([])
      }
      
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
      // Set default empty stats on error
      setStats({
        totalPosts: 0,
        totalLikesReceived: 0,
        totalLikesGiven: 0,
        currentStreak: 0,
        bestStreak: 0,
        level: 1,
        points: 0,
        lastPostDate: ''
      })
      setAchievements([])
      setArtworks([])
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

  const handleDeleteArtwork = async () => {
    if (!artworkToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch('/api/child/artworks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postId: artworkToDelete.id })
      })

      if (response.ok) {
        // Remove from local state
        setArtworks(prev => prev.filter(art => art.id !== artworkToDelete.id))
        setDeleteModalOpen(false)
        setArtworkToDelete(null)
        
        // Refresh stats
        fetchProfileData()
      } else {
        console.error('Failed to delete artwork')
      }
    } catch (error) {
      console.error('Error deleting artwork:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getTimeSlotIcon = (timeSlot: 'morning' | 'afternoon' | 'evening') => {
    switch (timeSlot) {
      case 'morning': return '🌅'
      case 'afternoon': return '☀️'
      case 'evening': return '🌆'
      default: return '✨'
    }
  }

  const getModerationBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">✅ Approved</span>
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⏳ Pending</span>
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">❌ Rejected</span>
    }
  }

  if (isLoading) {
    return (
      <ChildLayout>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <p className="text-xl font-semibold text-gray-700">Loading your amazing profile... 🎨</p>
          </div>
        </div>
      </ChildLayout>
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
    <ChildLayout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Simple Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 text-slate-800">
              My <span className="text-pink-400">Profile</span>
            </h1>
            <p className="text-xl text-slate-600 text-center">
              Your creative journey and achievements in one place
            </p>
          </div>
          {/* Profile Header */}
          <div className="bg-white rounded-3xl p-8 shadow-lg mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-xl bg-pink-500 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {profile.name[0].toUpperCase()}
                  </span>
                </div>
              </div>
              
              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h2 className="text-3xl font-bold text-slate-800">{profile.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-pink-500 text-white rounded-full font-semibold">
                      Level {profile.level}
                    </span>
                    <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full font-semibold">
                      <Star className="h-4 w-4 inline mr-1" />
                      {profile.totalPoints} points
                    </span>
                  </div>
                </div>
                
                <p className="text-slate-600 text-lg mb-4">@{profile.username}</p>
                
                {profile.bio && (
                  <p className="text-slate-700 mb-4 text-lg leading-relaxed">{profile.bio}</p>
                )}
                
                <div className="flex flex-col md:flex-row gap-4 text-sm text-slate-600">
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
            <div className="bg-white rounded-3xl p-2 shadow-lg">
              <div className="flex gap-2">
                {[
                  { id: 'overview', label: 'Overview', icon: TrendingUp },
                  { id: 'achievements', label: 'Achievements', icon: Trophy },
                  { id: 'artworks', label: 'My Art', icon: Palette }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all ${
                      activeTab === id
                        ? 'bg-pink-500 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-3xl p-6 shadow-lg text-center animate-fade-in">
                <div className="text-4xl mb-2">🎨</div>
                <div className="text-2xl font-bold text-slate-800">{stats?.totalPosts || 0}</div>
                <div className="text-slate-600">Artworks</div>
              </div>
              
              <div className="bg-white rounded-3xl p-6 shadow-lg text-center animate-fade-in">
                <div className="text-4xl mb-2">❤️</div>
                <div className="text-2xl font-bold text-slate-800">{stats?.totalLikesReceived || 0}</div>
                <div className="text-slate-600">Likes Received</div>
              </div>
              
              <div className="bg-white rounded-3xl p-6 shadow-lg text-center animate-fade-in">
                <div className="text-4xl mb-2">💖</div>
                <div className="text-2xl font-bold text-slate-800">{stats?.totalLikesGiven || 0}</div>
                <div className="text-slate-600">Likes Given</div>
              </div>
              
              <div className="bg-white rounded-3xl p-6 shadow-lg text-center animate-fade-in">
                <div className="text-4xl mb-2">🔥</div>
                <div className="text-2xl font-bold text-slate-800">{stats?.currentStreak || 0}</div>
                <div className="text-slate-600">Day Streak</div>
              </div>
            </div>
          )}


        {activeTab === 'achievements' && (
          <div className="animate-fade-in">
            {achievements.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.filter(a => a.earned).map((achievement, index) => (
                  <div
                    key={achievement.id}
                    className="bg-white rounded-3xl p-6 shadow-lg border border-green-200 animate-fade-in"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="text-center mb-4">
                      <div className="text-5xl mb-3">
                        {achievement.icon}
                      </div>
                      <h3 className="font-bold text-xl mb-2 text-slate-800">
                        {achievement.name}
                      </h3>
                      <p className="text-slate-600 text-sm mb-3">
                        {achievement.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-center gap-1 mb-4">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold text-yellow-600">{achievement.points} points</span>
                    </div>
                    
                    <div className="bg-green-100 text-green-700 font-bold text-sm py-3 px-4 rounded-2xl text-center">
                      <Trophy className="h-4 w-4 inline mr-1" />
                      Unlocked!
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">No Achievements Yet</h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Start creating artwork and completing challenges to unlock amazing achievements!
                </p>
                <Link href="/achievements">
                  <button className="bg-pink-500 text-white font-bold py-3 px-8 rounded-2xl hover:bg-pink-600 transition-colors">
                    View All Achievements
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}

          {activeTab === 'artworks' && (
            <div className="animate-fade-in">
              {artworks.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artworks.map((artwork) => (
                    <div key={artwork.id} className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                      <div className="relative">
                        <img 
                          src={artwork.imageUrl}
                          alt={artwork.altText}
                          className="w-full h-48 object-cover"
                        />
                        <button
                          onClick={() => {
                            setArtworkToDelete(artwork)
                            setDeleteModalOpen(true)
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors shadow-lg"
                          title="Delete this artwork"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{getTimeSlotIcon(artwork.timeSlot)}</span>
                          {getModerationBadge(artwork.moderationStatus)}
                        </div>
                        
                        <p className="text-slate-700 font-medium mb-2 line-clamp-2">
                          {artwork.altText}
                        </p>
                        
                        {artwork.challenge && (
                          <p className="text-sm text-pink-600 mb-2">
                            Challenge: {artwork.challenge.text.slice(0, 50)}...
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span>{artwork.likesCount} likes</span>
                          </div>
                          <span>{new Date(artwork.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">No Artwork Yet</h3>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto">
                    Create your first masterpiece and watch your gallery come to life!
                  </p>
                  <Link href="/child-home">
                    <button className="bg-pink-500 text-white font-bold py-4 px-8 rounded-2xl hover:bg-pink-600 transition-colors">
                      <span className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Start Creating
                      </span>
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        {/* Delete Confirmation Modal */}
        {deleteModalOpen && artworkToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 animate-fade-in">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Artwork?</h3>
                <p className="text-slate-600 mb-6">
                  Are you sure you want to delete "{artworkToDelete.altText}"? This action cannot be undone.
                </p>
                
                <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-6 border-2 border-slate-200">
                  <img 
                    src={artworkToDelete.thumbnailUrl || artworkToDelete.imageUrl}
                    alt={artworkToDelete.altText}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setDeleteModalOpen(false)
                      setArtworkToDelete(null)
                    }}
                    className="flex-1 py-3 px-4 rounded-2xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteArtwork}
                    disabled={isDeleting}
                    className="flex-1 py-3 px-4 rounded-2xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </ChildLayout>
  )
}