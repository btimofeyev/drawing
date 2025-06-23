'use client'

import { useState, useEffect } from 'react'
import { 
  Home,
  Palette, 
  Star, 
  Trophy, 
  Calendar,
  Camera,
  Users,
  Target,
  TrendingUp,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Child {
  id: string
  username: string
  name: string
  ageGroup: 'preschoolers' | 'kids' | 'tweens'
}

interface UserStats {
  points: number
  level: number
  totalPosts: number
  earnedAchievements: number
  pointsToNextLevel: number
  progressToNextLevel: number
}

interface ChildLayoutProps {
  children: React.ReactNode
}

export default function ChildLayout({ children }: ChildLayoutProps) {
  const [child, setChild] = useState<Child | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    fetchUserData()
  }, [])

  // Level calculation system
  const calculateLevel = (points: number) => {
    if (points < 100) return 1
    if (points < 300) return 2  // 100-299
    if (points < 600) return 3  // 300-599
    if (points < 1000) return 4 // 600-999
    if (points < 1500) return 5 // 1000-1499
    return Math.floor(points / 500) + 2 // 500 points per level after level 5
  }

  const getPointsForLevel = (level: number) => {
    if (level <= 1) return 0
    if (level === 2) return 100
    if (level === 3) return 300
    if (level === 4) return 600
    if (level === 5) return 1000
    return 1500 + (level - 6) * 500
  }

  const getPointsForNextLevel = (level: number) => {
    return getPointsForLevel(level + 1)
  }

  const fetchUserData = async () => {
    try {
      // Fetch both stats and achievements to get accurate points
      const [statsRes, achievementsRes] = await Promise.all([
        fetch('/api/child/stats'),
        fetch('/api/child/achievements')
      ])
      
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setChild(statsData.child)
        
        // Calculate points from achievements if available
        let totalPoints = 0
        let earnedCount = 0
        
        if (achievementsRes.ok) {
          const achievementsData = await achievementsRes.json()
          const earnedAchievements = achievementsData.achievements?.filter((a: any) => a.earned) || []
          totalPoints = earnedAchievements.reduce((sum: number, a: any) => sum + (a.points || 0), 0)
          earnedCount = earnedAchievements.length
        }
        
        const currentLevel = calculateLevel(totalPoints)
        const pointsForCurrentLevel = getPointsForLevel(currentLevel)
        const pointsForNextLevel = getPointsForNextLevel(currentLevel)
        const pointsToNextLevel = pointsForNextLevel - totalPoints
        const progressToNextLevel = totalPoints > pointsForCurrentLevel 
          ? ((totalPoints - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100
          : 0
        
        setUserStats({ 
          points: totalPoints || statsData.stats?.points || 0,
          level: currentLevel,
          totalPosts: statsData.stats?.totalPosts || 0,
          earnedAchievements: earnedCount,
          pointsToNextLevel: Math.max(0, pointsToNextLevel),
          progressToNextLevel: Math.min(100, progressToNextLevel)
        })
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
      setUserStats({
        points: 0,
        level: 1,
        totalPosts: 0,
        earnedAchievements: 0,
        pointsToNextLevel: 100,
        progressToNextLevel: 0
      })
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/child/signout', { method: 'POST' })
    } catch (error) {
      console.error('Sign out failed:', error)
    } finally {
      window.location.href = '/'
    }
  }

  // Age-specific navigation and UI settings
  const getNavigationForAge = (ageGroup: string) => {
    const baseNavigation = [
      { name: 'Home', href: '/child-home', icon: Home, emoji: '🏠' },
      { name: 'Gallery', href: '/gallery', icon: Users, emoji: '🎨' },
      { name: 'Profile', href: '/profile', icon: Star, emoji: '⭐' },
      { name: 'Badges', href: '/achievements', icon: Trophy, emoji: '🏆' },
    ]

    if (ageGroup === 'preschoolers') {
      // Simpler navigation for preschoolers (ages 4-6)
      return [
        { name: 'Home', href: '/child-home', icon: Home, emoji: '🏠' },
        { name: 'Gallery', href: '/gallery', icon: Users, emoji: '🎨' },
        { name: 'Badges', href: '/achievements', icon: Trophy, emoji: '🏆' },
      ]
    } else if (ageGroup === 'kids') {
      // Standard navigation for kids (ages 7-10)
      return [
        ...baseNavigation,
        { name: 'Leaderboards', href: '/leaderboards', icon: TrendingUp, emoji: '📊' },
      ]
    } else {
      // Full navigation for tweens (ages 11-16)
      return [
        ...baseNavigation,
        { name: 'Leaderboards', href: '/leaderboards', icon: TrendingUp, emoji: '📊' },
      ]
    }
  }

  const navigation = getNavigationForAge(child?.ageGroup || 'kids')
  const isPreschooler = child?.ageGroup === 'preschoolers'

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Subtle Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg">
                  <span className="text-lg">🎨</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-800">Daily Scribble</h1>
                  <p className="text-xs text-pink-600 font-medium">Creative Community</p>
                </div>
              </div>
              <button
                className="lg:hidden p-1 rounded-lg hover:bg-slate-100"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>

          {/* User Info - Simple & Clean */}
          <div className="p-6 border-b border-slate-100">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-semibold text-slate-600">
                  {child?.name ? child.name[0].toUpperCase() : '🎨'}
                </span>
              </div>
              <h3 className="font-semibold text-slate-800">{child?.name || 'Young Artist'}</h3>
              <p className="text-sm text-slate-500 mb-4">@{child?.username || 'artist'}</p>
              
              {/* Age-Appropriate Level Progress */}
              {isPreschooler ? (
                // Simplified progress for preschoolers
                <div className="space-y-3">
                  <div className="text-center">
                    <span className="text-2xl">⭐</span>
                    <p className="text-base font-bold text-slate-800">Level {userStats?.level || 1}</p>
                    <p className="text-sm text-slate-600">{userStats?.points || 0} stars!</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-pink-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${userStats?.progressToNextLevel || 0}%` }}
                    />
                  </div>
                </div>
              ) : (
                // Standard progress for kids and tweens
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Level {userStats?.level || 1}</span>
                    <span className="text-slate-500">{userStats?.points || 0} pts</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div 
                      className="bg-pink-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${userStats?.progressToNextLevel || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    {userStats?.pointsToNextLevel || 100} points to level {(userStats?.level || 1) + 1}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Age-Appropriate Stats */}
          <div className="p-6 border-b border-slate-100">
            <div className={`grid grid-cols-2 gap-4 text-center ${isPreschooler ? 'space-y-2' : ''}`}>
              <div>
                <div className={`font-semibold text-slate-800 ${isPreschooler ? 'text-xl' : 'text-lg'}`}>
                  {isPreschooler && '🏆'} {userStats?.earnedAchievements || 0}
                </div>
                <div className={`text-slate-500 ${isPreschooler ? 'text-sm' : 'text-xs'}`}>
                  {isPreschooler ? 'Badges' : 'Achievements'}
                </div>
              </div>
              <div>
                <div className={`font-semibold text-slate-800 ${isPreschooler ? 'text-xl' : 'text-lg'}`}>
                  {isPreschooler && '🎨'} {userStats?.totalPosts || 0}
                </div>
                <div className={`text-slate-500 ${isPreschooler ? 'text-sm' : 'text-xs'}`}>
                  {isPreschooler ? 'Drawings' : 'Artworks'}
                </div>
              </div>
            </div>
          </div>

          {/* Age-Appropriate Navigation */}
          <nav className={`flex-1 p-4 ${isPreschooler ? 'space-y-3' : 'space-y-1'}`}>
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center gap-3 rounded-lg transition-colors ${
                    isPreschooler 
                      ? 'px-4 py-4 text-base' // Larger touch targets for preschoolers
                      : 'px-3 py-2 text-sm'   // Standard size for others
                  } ${
                    isActive(item.href)
                      ? 'bg-pink-50 text-pink-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}>
                    {isPreschooler ? (
                      // Show emoji icons for preschoolers
                      <span className="text-xl">{item.emoji}</span>
                    ) : (
                      // Show lucide icons for older children
                      <Icon className="h-4 w-4" />
                    )}
                    <span className={`font-medium ${isPreschooler ? 'text-base' : 'text-sm'}`}>
                      {item.name}
                    </span>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Simple Footer */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-red-600 rounded-lg transition-colors text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Clean Mobile Header */}
        <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-md">
                <span className="text-sm">🎨</span>
              </div>
              <span className="font-bold text-slate-800">Daily Scribble</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-medium text-slate-700">{userStats?.points || 0}</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}