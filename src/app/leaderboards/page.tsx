'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Camera, 
  Heart, 
  Zap, 
  Trophy,
  Star,
  Crown,
  Calendar,
  Users,
  Medal,
  Palette
} from 'lucide-react'
import Link from 'next/link'
import ChildLayout from '@/components/ChildLayout'

interface LeaderboardEntry {
  rank: number
  username: string
  name: string
  ageGroup: 'kids' | 'tweens'
  count: number
  isCurrentChild: boolean
  avatar?: string
  level?: number
  totalPoints?: number
}

interface Leaderboards {
  weeklyUploads: LeaderboardEntry[]
  weeklyLikes: LeaderboardEntry[]
  currentStreaks: LeaderboardEntry[]
  monthlyUploads: LeaderboardEntry[]
  monthlyLikes: LeaderboardEntry[]
  newArtists: LeaderboardEntry[]
  mostImproved: LeaderboardEntry[]
  communityStars: LeaderboardEntry[]
}

interface Child {
  id: string
  username: string
  name: string
  level: number
  totalPoints: number
}

type LeaderboardType = 'weeklyUploads' | 'weeklyLikes' | 'currentStreaks' | 'monthlyUploads' | 'monthlyLikes' | 'newArtists' | 'mostImproved' | 'communityStars'

export default function LeaderboardsPage() {
  const [leaderboards, setLeaderboards] = useState<Leaderboards | null>(null)
  const [child, setChild] = useState<Child | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<LeaderboardType>('weeklyUploads')

  useEffect(() => {
    fetchLeaderboardData()
  }, [])

  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch leaderboards and child data in parallel
      const [leaderboardsRes, statsRes] = await Promise.all([
        fetch('/api/leaderboards/weekly'),
        fetch('/api/child/stats')
      ])

      if (leaderboardsRes.ok) {
        const leaderboardsData = await leaderboardsRes.json()
        setLeaderboards(leaderboardsData.leaderboards)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setChild(statsData.child)
      }
    } catch (error) {
      console.error('Failed to load leaderboards:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getLeaderboardConfig = (type: LeaderboardType) => {
    const configs = {
      weeklyUploads: {
        title: 'Most Creative This Week',
        icon: <Camera className="h-5 w-5" />,
        color: 'primary',
        suffix: 'uploads',
        description: 'Artists who shared the most artwork this week',
        howToAchieve: 'Upload artwork every day this week to climb the rankings!'
      },
      weeklyLikes: {
        title: 'Most Loved This Week', 
        icon: <Heart className="h-5 w-5" />,
        color: 'red',
        suffix: 'likes',
        description: 'Artists whose work received the most love this week',
        howToAchieve: 'Create amazing artwork that inspires others to like your posts!'
      },
      currentStreaks: {
        title: 'Dedication Champions',
        icon: <Zap className="h-5 w-5" />,
        color: 'accent',
        suffix: 'days',
        description: 'Artists with the longest daily creation streaks',
        howToAchieve: 'Upload artwork every single day to build your streak!'
      },
      monthlyUploads: {
        title: 'Monthly Creators',
        icon: <Palette className="h-5 w-5" />,
        color: 'secondary',
        suffix: 'uploads',
        description: 'Monthly champions of consistent creation',
        howToAchieve: 'Share your artwork regularly throughout the month!'
      },
      monthlyLikes: {
        title: 'Monthly Favorites',
        icon: <Star className="h-5 w-5" />,
        color: 'purple',
        suffix: 'likes',
        description: 'Monthly favorites among the community',
        howToAchieve: 'Create artwork that resonates with the community all month long!'
      },
      newArtists: {
        title: 'Rising Stars',
        icon: <Star className="h-5 w-5" />,
        color: 'green',
        suffix: 'uploads',
        description: 'New artists making their mark in their first month',
        howToAchieve: 'New to Daily Scribble? Upload your first artworks to join the rising stars!'
      },
      mostImproved: {
        title: 'Growth Champions',
        icon: <TrendingUp className="h-5 w-5" />,
        color: 'blue',
        suffix: 'more uploads',
        description: 'Artists who increased their uploads the most this week vs last week',
        howToAchieve: 'Upload more artwork this week than you did last week to show growth!'
      },
      communityStars: {
        title: 'Community Heroes',
        icon: <Users className="h-5 w-5" />,
        color: 'orange',
        suffix: 'likes given this week',
        description: 'Artists spreading the most positivity this week by liking others\' artwork',
        howToAchieve: 'Show love to other artists by liking their amazing creations this week!'
      }
    }
    return configs[type]
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return (
      <div className="flex flex-col items-center">
        <Crown className="h-6 w-6 text-white" />
        <span className="text-xs font-bold text-white mt-1">1st</span>
      </div>
    )
    if (rank === 2) return (
      <div className="flex flex-col items-center">
        <Medal className="h-6 w-6 text-white" />
        <span className="text-xs font-bold text-white mt-1">2nd</span>
      </div>
    )
    if (rank === 3) return (
      <div className="flex flex-col items-center">
        <Medal className="h-6 w-6 text-white" />
        <span className="text-xs font-bold text-white mt-1">3rd</span>
      </div>
    )
    return <span className="text-lg font-bold text-slate-500">#{rank}</span>
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
    if (rank === 2) return 'bg-gradient-to-r from-slate-400 to-slate-600 text-white'
    if (rank === 3) return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
    return 'bg-slate-100'
  }

  if (isLoading) {
    return (
      <ChildLayout>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-pink-500 flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <p className="text-xl font-semibold text-slate-700">Loading leaderboards...</p>
          </div>
        </div>
      </ChildLayout>
    )
  }

  const currentLeaderboard = leaderboards?.[activeTab] || []
  const config = getLeaderboardConfig(activeTab)

  return (
    <ChildLayout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Simple Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 text-slate-800">
              <span className="text-pink-400">Leaderboards</span>
            </h1>
            <p className="text-xl text-slate-600 text-center">
              Celebrate achievements and discover amazing artists in our community!
            </p>
          </div>
          {/* Leaderboard Categories */}
          <div className="bg-white rounded-3xl p-6 shadow-lg mb-8 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { key: 'weeklyUploads', label: 'Weekly Creative', icon: <Camera className="h-4 w-4" /> },
                { key: 'monthlyUploads', label: 'Monthly Creative', icon: <Palette className="h-4 w-4" /> },
                { key: 'weeklyLikes', label: 'Weekly Loved', icon: <Heart className="h-4 w-4" /> },
                { key: 'monthlyLikes', label: 'Monthly Loved', icon: <Star className="h-4 w-4" /> },
                { key: 'mostImproved', label: 'Growth', icon: <TrendingUp className="h-4 w-4" /> },
                { key: 'currentStreaks', label: 'Dedication', icon: <Zap className="h-4 w-4" /> },
                { key: 'newArtists', label: 'Rising Stars', icon: <Star className="h-4 w-4" /> },
                { key: 'communityStars', label: 'Community Heroes', icon: <Users className="h-4 w-4" /> }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as LeaderboardType)}
                  className={`flex flex-col items-center gap-2 px-3 py-4 rounded-2xl font-medium transition-all text-sm ${
                    activeTab === key
                      ? 'bg-pink-500 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {icon}
                  <span className="text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Current Leaderboard */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-pink-50 p-6 border-b border-slate-200 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                {config.icon}
                <h2 className="text-2xl font-bold text-slate-800">{config.title}</h2>
              </div>
              <p className="text-slate-600 mb-3">{config.description}</p>
              <div className="bg-white rounded-xl p-4 border border-pink-200">
                <p className="text-sm font-medium text-pink-700">
                  💡 How to get here: {config.howToAchieve}
                </p>
              </div>
            </div>

          {/* Leaderboard Content */}
          <div className="p-6">
            {currentLeaderboard.length > 0 ? (
              <div className="space-y-4">
                {/* Top 3 Podium */}
                {currentLeaderboard.slice(0, 3).length > 0 && (
                  <div className="grid md:grid-cols-3 gap-6 mb-8 p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl">
                    {currentLeaderboard.slice(0, 3).map((entry, index) => (
                      <div
                        key={`podium-${entry.rank}`}
                        className={`text-center p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                          entry.isCurrentChild ? 'border-pink-300 bg-pink-50' : 'border-slate-200 bg-white'
                        } ${index === 0 ? 'md:order-2 transform md:scale-110' : index === 1 ? 'md:order-1' : 'md:order-3'}`}
                      >
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-white ${getRankBadgeColor(entry.rank)}`}>
                          {getRankIcon(entry.rank)}
                        </div>
                        
                        <h3 className={`font-bold text-lg mb-1 ${entry.isCurrentChild ? 'text-pink-700' : 'text-slate-900'}`}>
                          {entry.isCurrentChild ? 'You!' : entry.name.split(' ')[0]}
                        </h3>
                        
                        <p className="text-slate-600 text-sm mb-2">@{entry.username}</p>
                        
                        <div className="flex items-center justify-center gap-1 text-2xl font-bold text-slate-800">
                          <span>{entry.count}</span>
                          <span className="text-sm text-slate-500">{config.suffix}</span>
                        </div>
                        
                        {entry.level && (
                          <div className="mt-2 text-xs text-slate-500">
                            Level {entry.level}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Full Rankings */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Full Rankings
                  </h3>
                  
                  {currentLeaderboard.map((entry, index) => (
                    <div
                      key={`full-${entry.rank}`}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:scale-102 animate-fade-in ${
                        entry.isCurrentChild 
                          ? 'bg-pink-50 border-2 border-pink-200 shadow-md' 
                          : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                      }`}
                      style={{animationDelay: `${index * 0.05}s`}}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className={`${entry.rank <= 3 ? 'w-16 h-16' : 'w-12 h-12'} rounded-xl flex items-center justify-center ${
                          entry.rank <= 3 
                            ? getRankBadgeColor(entry.rank) + ' text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {entry.rank <= 3 ? getRankIcon(entry.rank) : `#${entry.rank}`}
                        </div>
                        
                        {/* User Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-bold ${entry.isCurrentChild ? 'text-pink-700' : 'text-slate-900'}`}>
                              {entry.isCurrentChild ? 'You' : entry.name.split(' ')[0]}
                            </h4>
                            <span className="text-slate-500 text-sm">@{entry.username}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              entry.ageGroup === 'kids' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {entry.ageGroup}
                            </span>
                          </div>
                          {entry.level && (
                            <div className="text-xs text-slate-500 mt-1">
                              Level {entry.level} • {entry.totalPoints} total points
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Score */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-800">
                          {entry.count}
                        </div>
                        <div className="text-sm text-slate-500">
                          {config.suffix}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No data yet</h3>
                <p className="text-slate-600">Be the first to make your mark on this leaderboard!</p>
              </div>
            )}
          </div>
          </div>

          {/* Encouragement */}
          <div className="mt-8 bg-pink-50 rounded-3xl p-8 text-center animate-fade-in">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Keep Creating!</h3>
            <p className="text-slate-600 mb-6 text-center">
              Every artwork you create is an achievement! These leaderboards celebrate our community's creativity and growth. 
              Remember, it's about having fun and improving your artistic skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/child-home" className="bg-pink-500 text-white font-bold py-3 px-8 rounded-2xl hover:bg-pink-600 transition-colors">
                Start Creating
              </Link>
              <Link href="/gallery" className="bg-white text-slate-700 font-bold py-3 px-8 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-200">
                Browse Gallery
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ChildLayout>
  )
}