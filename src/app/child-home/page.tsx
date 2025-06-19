'use client'

import { useState, useEffect } from 'react'
import { 
  Palette, 
  Star, 
  Trophy, 
  Calendar, 
  Camera, 
  Heart, 
  Users, 
  Gift, 
  Sparkles,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react'
import Link from 'next/link'

interface DailyChallenge {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  emoji: string
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  progress?: number
  total?: number
}

interface UserStats {
  totalPosts: number
  totalLikes: number
  currentStreak: number
  level: number
  points: number
}

export default function ChildHomePage() {
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data - in real app this would come from API
    setDailyChallenge({
      id: '1',
      title: 'Draw Your Dream Pet',
      description: 'Create an artwork of your perfect imaginary pet! It can be magical, colorful, or totally unique.',
      difficulty: 'easy',
      emoji: '🐾'
    })

    setAchievements([
      { id: '1', name: 'First Drawing', icon: '🎨', description: 'Upload your first artwork', earned: true },
      { id: '2', name: 'Social Butterfly', icon: '👍', description: 'Give 10 likes', earned: true },
      { id: '3', name: 'Popular Artist', icon: '⭐', description: 'Get 25 likes', earned: false, progress: 12, total: 25 },
      { id: '4', name: 'Daily Creator', icon: '🔥', description: '7 day streak', earned: false, progress: 3, total: 7 },
    ])

    setUserStats({
      totalPosts: 8,
      totalLikes: 42,
      currentStreak: 3,
      level: 2,
      points: 150
    })

    setUsername('coolartist123')
    setIsLoading(false)
  }, [])

  const handleSignOut = () => {
    // In real app, call API to sign out
    window.location.href = '/'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 float"
               style={{background: 'var(--gradient-rainbow)'}}>
            <Palette className="h-8 w-8 text-white" />
          </div>
          <p className="text-xl font-semibold text-gray-700">Loading your art studio... 🎨</p>
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
              <div className="w-12 h-12 rounded-xl flex items-center justify-center float"
                   style={{background: 'var(--gradient-primary)'}}>
                <Palette className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">DrawingBuddy</h1>
                <p className="text-sm text-primary-600">Welcome back, {username}! 🎨</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-accent-100 rounded-full">
                <Star className="h-5 w-5 text-accent-600" />
                <span className="font-bold text-accent-700">{userStats?.points} points</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12 fade-in">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Ready to Create
            </span>
            <br />
            <span className="bg-gradient-to-r from-secondary-500 to-accent-500 bg-clip-text text-transparent">
              Something Amazing?
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your creative journey continues! Check out today's challenge and see what other artists are creating.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Daily Challenge - Featured */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-primary-100 hover:shadow-2xl transition-all duration-300 bounce-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                     style={{background: 'var(--gradient-accent)'}}>
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Today's Challenge</h3>
                  <p className="text-accent-600 font-semibold">New adventure awaits! ✨</p>
                </div>
              </div>
              
              {dailyChallenge && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{dailyChallenge.emoji}</span>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{dailyChallenge.title}</h4>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        dailyChallenge.difficulty === 'easy' 
                          ? 'bg-green-100 text-green-700'
                          : dailyChallenge.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'  
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {dailyChallenge.difficulty} level
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {dailyChallenge.description}
                  </p>
                  
                  <div className="flex gap-4">
                    <Link href="/create">
                      <button className="text-white font-bold py-4 px-8 rounded-2xl hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                              style={{background: 'var(--gradient-primary)'}}>
                        <span className="flex items-center gap-2">
                          <Camera className="h-5 w-5" />
                          Start Creating
                          <Sparkles className="h-5 w-5" />
                        </span>
                      </button>
                    </Link>
                    <Link href="/gallery">
                      <button className="bg-white border-2 border-secondary-200 text-secondary-700 font-bold py-4 px-8 rounded-2xl hover:bg-secondary-50 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
                        <span className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          See Others' Art
                        </span>
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats & Level */}
          <div className="space-y-6">
            {/* Level & Progress */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-purple-100 slide-in-left">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                     style={{background: 'var(--gradient-purple)'}}>
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Level {userStats?.level}</h3>
                <p className="text-purple-600 font-semibold">Creative Artist</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-700">{userStats?.points}</div>
                  <div className="text-sm text-purple-600">Total Points</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary-50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-primary-700">{userStats?.totalPosts}</div>
                    <div className="text-xs text-primary-600">Artworks</div>
                  </div>
                  <div className="bg-secondary-50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-secondary-700">{userStats?.totalLikes}</div>
                    <div className="text-xs text-secondary-600">Likes</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Streak Counter */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-accent-100 slide-in-left" 
                 style={{animationDelay: '0.2s'}}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{background: 'var(--gradient-accent)'}}>
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Daily Streak</h4>
                  <p className="text-sm text-gray-600">Keep creating!</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-600 mb-2">
                  {userStats?.currentStreak} 🔥
                </div>
                <p className="text-sm text-gray-600">
                  {userStats?.currentStreak === 1 ? 'day' : 'days'} in a row
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mt-12 fade-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{background: 'var(--gradient-secondary)'}}>
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Your Achievements</h3>
              <p className="text-gray-600">Collect badges as you create and explore!</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <div
                key={achievement.id}
                className={`bg-white rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:scale-105 bounce-in ${
                  achievement.earned 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="text-center">
                  <div className={`text-4xl mb-3 ${achievement.earned ? 'grayscale-0' : 'grayscale'}`}>
                    {achievement.icon}
                  </div>
                  <h4 className={`font-bold mb-2 ${
                    achievement.earned ? 'text-green-700' : 'text-gray-700'
                  }`}>
                    {achievement.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {achievement.description}
                  </p>
                  
                  {!achievement.earned && achievement.progress && achievement.total && (
                    <div className="space-y-2">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {achievement.progress}/{achievement.total}
                      </p>
                    </div>
                  )}
                  
                  {achievement.earned && (
                    <div className="text-green-600 font-semibold text-sm">
                      ✅ Earned!
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 fade-in">
          <Link href="/gallery">
            <div className="group bg-white rounded-3xl p-8 shadow-lg border border-secondary-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                   style={{background: 'var(--gradient-secondary)'}}>
                <Users className="h-7 w-7 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 text-center mb-3">Art Gallery</h4>
              <p className="text-gray-600 text-center">
                Explore amazing artwork from artists around the world! 🌍
              </p>
            </div>
          </Link>

          <Link href="/profile">
            <div className="group bg-white rounded-3xl p-8 shadow-lg border border-purple-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                   style={{background: 'var(--gradient-purple)'}}>
                <Star className="h-7 w-7 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 text-center mb-3">My Profile</h4>
              <p className="text-gray-600 text-center">
                Check your stats, achievements, and customize your artist profile! ⭐
              </p>
            </div>
          </Link>

          <Link href="/challenges">
            <div className="group bg-white rounded-3xl p-8 shadow-lg border border-accent-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                   style={{background: 'var(--gradient-accent)'}}>
                <Target className="h-7 w-7 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 text-center mb-3">All Challenges</h4>
              <p className="text-gray-600 text-center">
                Browse all creative challenges and find your next adventure! 🎯
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}